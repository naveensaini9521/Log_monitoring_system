from flask import jsonify, request
from bson import ObjectId
from datetime import datetime, timedelta
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id

@viewer_bp.route('/analytics/resource/<resource_id>', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def resource_analytics(current_user, resource_id):
    db = get_db()
    resource = db.user_resources.find_one({"_id": ObjectId(resource_id), "user_id": get_user_id(current_user)})
    if not resource:
        return jsonify({"error": "Unauthorized"}), 403
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    pipeline = [
        {"$match": {
            "$or": [{"source": resource["address"]}, {"resource_id": resource_id}],
            "timestamp": {"$gte": seven_days_ago}
        }},
        {"$group": {
            "_id": "$level",
            "count": {"$sum": 1}
        }}
    ]
    severity_counts = list(db.logs.aggregate(pipeline))
    return jsonify({"resource_id": resource_id, "severity_breakdown": severity_counts})

@viewer_bp.route('/analytics/timeseries', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_timeseries(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    service = request.args.get('service')
    days = int(request.args.get('days', 7))
    if not service:
        return jsonify({"error": "service parameter required"}), 400

    resource = db.user_resources.find_one({"user_id": user_id, "address": service})
    if not resource:
        return jsonify([])

    cutoff = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        {"$match": {"source": service, "timestamp": {"$gte": cutoff}}},
        {"$group": {
            "_id": {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"},
                "day": {"$dayOfMonth": "$timestamp"},
                "hour": {"$hour": "$timestamp"}
            },
            "count": {"$sum": 1},
            "errors": {"$sum": {"$cond": [{"$eq": ["$level", "ERROR"]}, 1, 0]}}
        }},
        {"$sort": {"_id": 1}}
    ]
    results = list(db.logs.aggregate(pipeline))
    series = []
    for r in results:
        ts = datetime(r["_id"]["year"], r["_id"]["month"], r["_id"]["day"], r["_id"]["hour"])
        series.append({
            "timestamp": ts.isoformat(),
            "count": r["count"],
            "errors": r["errors"]
        })
    return jsonify(series)

@viewer_bp.route('/analytics/top_errors', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_top_errors(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    service = request.args.get('service')
    limit = int(request.args.get('limit', 10))
    if not service:
        return jsonify([])

    resource = db.user_resources.find_one({"user_id": user_id, "address": service})
    if not resource:
        return jsonify([])

    pipeline = [
        {"$match": {"source": service, "level": "ERROR"}},
        {"$group": {
            "_id": "$message",
            "count": {"$sum": 1},
            "last_seen": {"$max": "$timestamp"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    results = list(db.logs.aggregate(pipeline))
    return jsonify([
        {"message": r["_id"], "count": r["count"], "last_seen": r["last_seen"].isoformat()}
        for r in results
    ])