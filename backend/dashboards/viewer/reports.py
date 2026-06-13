from flask import jsonify, request, make_response
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from bson import ObjectId
from datetime import datetime
from .utils import get_user_id   
import json
import csv
import io

def get_metrics(service, start_date, end_date):
    db = get_db()
    pipeline = [
        {"$match": {
            "source": service,
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }},
        {"$group": {
            "_id": None,
            "total_logs": {"$sum": 1},
            "errors": {"$sum": {"$cond": [{"$eq": ["$level", "ERROR"]}, 1, 0]}},
            "warns": {"$sum": {"$cond": [{"$eq": ["$level", "WARN"]}, 1, 0]}},
            "unique_ips": {"$addToSet": "$user_id"}
        }}
    ]
    result = list(db.logs.aggregate(pipeline))
    if not result:
        return {"total_logs": 0, "errors": 0, "warns": 0, "unique_ips": 0}
    r = result[0]
    return {
        "total_logs": r.get("total_logs", 0),
        "errors": r.get("errors", 0),
        "warns": r.get("warns", 0),
        "unique_ips": len(r.get("unique_ips", []))
    }

def get_top_errors(service, start_date, end_date, limit=5):
    db = get_db()
    pipeline = [
        {"$match": {"source": service, "level": "ERROR", "timestamp": {"$gte": start_date, "$lte": end_date}}},
        {"$group": {"_id": "$message", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    return list(db.logs.aggregate(pipeline))

def get_anomaly_count(service, start_date, end_date):
    db = get_db()
    resource = db.user_resources.find_one({"address": service})
    if not resource:
        return 0
    return db.anomalies.count_documents({
        "resource_id": resource["_id"],
        "timestamp": {"$gte": start_date, "$lte": end_date}
    })

@viewer_bp.route('/reports', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def get_reports(current_user):
    db = get_db()
    user_id = get_user_id(current_user)   # use helper
    report_type = request.args.get('type')
    query = {"user_id": user_id}          # only show reports created by this user
    if report_type and report_type != 'all':
        query['type'] = report_type
    reports_cursor = db.generated_reports.find(query).sort("created_at", -1).limit(50)
    reports = []
    for r in reports_cursor:
        reports.append({
            "id": str(r["_id"]),
            "name": r["name"],
            "type": r["type"],
            "date": r["created_at"].strftime("%Y-%m-%d %H:%M"),
            "size": r.get("size", "N/A"),
            "format": r.get("format", "JSON")
        })
    return jsonify(reports)

@viewer_bp.route('/reports/generate', methods=['POST'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def generate_report(current_user):
    try:
        data = request.get_json()
        service = data.get('service')
        report_type = data.get('type', 'Custom')
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')
        
        if not service or not start_date_str or not end_date_str:
            return jsonify({"error": "Missing parameters"}), 400
        
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
        except Exception as e:
            return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
        
        db = get_db()
        user_id = get_user_id(current_user)
        
        # Debug: print what we're looking for
        print(f"Looking for service: '{service}' for user_id: {user_id}")
        
        resource = db.user_resources.find_one({"address": service, "user_id": user_id})
        if not resource:
            resource = db.user_resources.find_one({"name": service, "user_id": user_id})
        
        if not resource:
            # List available resources for debugging
            available = list(db.user_resources.find({"user_id": user_id}, {"name":1, "address":1}))
            print(f"Available resources: {available}")
            return jsonify({"error": f"Service '{service}' not found for this user. Available: {[r.get('address') or r.get('name') for r in available]}"}), 403
        
        # Compute metrics with try/except to isolate issues
        try:
            metrics = get_metrics(service, start_date, end_date)
        except Exception as e:
            print(f"Metrics error: {e}")
            import traceback
            traceback.print_exc()
            metrics = {"total_logs": 0, "errors": 0, "warns": 0, "unique_ips": 0}
        
        try:
            top_errors = get_top_errors(service, start_date, end_date)
        except Exception as e:
            print(f"Top errors error: {e}")
            traceback.print_exc()
            top_errors = []
        
        try:
            anomaly_count = get_anomaly_count(service, start_date, end_date)
        except Exception as e:
            print(f"Anomaly count error: {e}")
            traceback.print_exc()
            anomaly_count = 0
        
        report_data = {
            "service": service,
            "report_type": report_type,
            "date_range": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "generated_at": datetime.utcnow().isoformat(),
            "metrics": metrics,
            "top_errors": [{"message": e["_id"], "count": e["count"]} for e in top_errors],
            "anomalies_detected": anomaly_count
        }
        
        report_doc = {
            "name": f"{report_type}_Report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "type": report_type,
            "service": service,
            "data": report_data,
            "created_at": datetime.utcnow(),
            "user_id": user_id,
            "size": f"{len(json.dumps(report_data)) / 1024:.1f} KB",
            "format": "JSON"
        }
        result = db.generated_reports.insert_one(report_doc)
        report_doc["id"] = str(result.inserted_id)
        
        return jsonify({"success": True, "report": report_doc}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@viewer_bp.route('/reports/<report_id>/download', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def download_report(current_user, report_id):
    db = get_db()
    user_id = get_user_id(current_user)
    report = db.generated_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Authorization: only owner or super_admin
    if report.get("user_id") != user_id and current_user.get('role') != 'super_admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    format_type = request.args.get('format', 'json')
    data = report.get("data", {})
    
    if format_type == 'json':
        response = make_response(json.dumps(data, indent=2))
        response.mimetype = 'application/json'
        response.headers['Content-Disposition'] = f'attachment; filename=report_{report_id}.json'
        return response
    elif format_type == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Metric", "Value"])
        for k, v in data.get("metrics", {}).items():
            writer.writerow([k, v])
        writer.writerow(["Anomalies Detected", data.get("anomalies_detected", 0)])
        writer.writerow([])
        writer.writerow(["Top Errors", "Count"])
        for err in data.get("top_errors", []):
            writer.writerow([err["message"], err["count"]])
        response = make_response(output.getvalue())
        response.mimetype = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=report_{report_id}.csv'
        return response
    else:
        return jsonify({"error": "Unsupported format"}), 400