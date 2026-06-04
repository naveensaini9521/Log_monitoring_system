# backend/dashboards/viewer/ai_recommandations.py
from flask import jsonify, request
from datetime import datetime, timedelta
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id

@viewer_bp.route('/ai-recommendations', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_ai_recommendations(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    time_range = request.args.get('timeRange', '24h')
    
    cutoff = datetime.utcnow() - timedelta(hours=24 if time_range=='24h' else 168 if time_range=='7d' else 720)
    
    owned_resources = list(db.user_resources.find({"user_id": user_id}))
    resource_ids = [r["_id"] for r in owned_resources]
    recommendations = []
    
    # 1. Recent high-severity anomalies
    high_anomalies = list(db.anomalies.find({
        "resource_id": {"$in": resource_ids},
        "severity": "high",
        "timestamp": {"$gte": datetime.utcnow() - timedelta(hours=1)}
    }).limit(3))
    
    for anom in high_anomalies:
        resource = db.user_resources.find_one({"_id": anom["resource_id"]})
        recommendations.append({
            "id": f"rec_anom_{anom['_id']}",
            "title": f"Critical on {resource['name']}",
            "description": anom.get("message", "High severity anomaly"),
            "action": "Investigate",
            "resourceId": str(anom["resource_id"]),
            "status": "pending"
        })
    
    # 2. High error rate in last 15 minutes
    fifteen_min_ago = datetime.utcnow() - timedelta(minutes=15)
    for res in owned_resources:
        error_count = db.logs.count_documents({
            "source": res["address"],
            "timestamp": {"$gte": fifteen_min_ago},
            "level": "ERROR"
        })
        if error_count > 5:
            recommendations.append({
                "id": f"rec_errors_{res['_id']}",
                "title": f"High error rate on {res['name']}",
                "description": f"{error_count} errors in last 15 minutes",
                "action": "View logs",
                "resourceId": str(res["_id"]),
                "status": "pending"
            })
    
    # 3. Always show log rotation suggestion
    recommendations.append({
        "id": "rec_log_rotation",
        "title": "Enable Log Rotation",
        "description": "Prevent disk full errors by configuring log rotation.",
        "action": "Apply Policy",
        "resourceId": None,
        "status": "pending"
    })
    
    return jsonify(recommendations[:5])

# NEW ENDPOINT: apply AI recommendation
@viewer_bp.route('/ai-recommendations/apply', methods=['POST'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def apply_ai_recommendation(current_user):
    data = request.get_json()
    rec_id = data.get('recommendationId')
    # In a real system, implement the action (e.g., restart service, scale, etc.)
    print(f"Applying recommendation {rec_id} for user {get_user_id(current_user)}")
    # For now, just return success
    return jsonify({"message": "Action applied successfully"}), 200