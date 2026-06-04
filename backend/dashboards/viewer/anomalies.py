from flask import jsonify, request
from datetime import datetime, timedelta
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id

def get_cutoff(time_range):
    now = datetime.utcnow()
    if time_range == '24h':
        return now - timedelta(hours=24)
    elif time_range == '7d':
        return now - timedelta(days=7)
    elif time_range == '30d':
        return now - timedelta(days=30)
    return now - timedelta(hours=24)

@viewer_bp.route('/anomalies', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_anomalies(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    time_range = request.args.get('timeRange', '24h')
    service = request.args.get('service')
    
    cutoff = get_cutoff(time_range)
    
    owned_resources = list(db.user_resources.find({"user_id": user_id}))
    if not owned_resources:
        return jsonify([])
    
    resource_ids = [r["_id"] for r in owned_resources]
    query = {"resource_id": {"$in": resource_ids}, "timestamp": {"$gte": cutoff}}
    
    if service and service != 'null':
        # Find resource id for that service address
        resource = db.user_resources.find_one({"user_id": user_id, "address": service})
        if resource:
            query["resource_id"] = resource["_id"]
        else:
            return jsonify([])
    
    anomalies_cursor = db.anomalies.find(query).sort("timestamp", -1).limit(50)
    anomalies = []
    for a in anomalies_cursor:
        resource = db.user_resources.find_one({"_id": a["resource_id"]})
        resource_name = resource["name"] if resource else "Unknown"
        anomalies.append({
            "id": str(a["_id"]),
            "resourceId": str(a["resource_id"]),
            "resourceName": resource_name,
            "message": a.get("message", ""),
            "severity": a.get("severity", "medium"),
            "timestamp": a["timestamp"].isoformat(),
            "recommendation": a.get("recommendation")
        })
    return jsonify(anomalies)