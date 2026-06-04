# backend/dashboards/viewer/stats.py
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
    elif time_range == 'all':
        # Return a very old date (e.g., year 2000) to include all logs
        return datetime(2000, 1, 1)
    return now - timedelta(hours=24)

@viewer_bp.route('/stats', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_stats(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    time_range = request.args.get('timeRange', '24h')
    cutoff = get_cutoff(time_range)
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)

    # Get all resources owned by this user
    user_resources = list(db.user_resources.find({"user_id": user_id}))
    if not user_resources:
        return jsonify({"totalLogs": 0, "activeSources": 0, "anomaliesCount": 0, "uptime": "99.9%", "changes": {}})

    resource_addresses = [r["address"] for r in user_resources]
    print(f"[DEBUG] User ID: {user_id}")
    print(f"[DEBUG] Resource addresses: {resource_addresses}")

    # Build query: match logs where 'source' field is in resource_addresses
    log_filter = {
        "timestamp": {"$gte": cutoff},
        "source": {"$in": resource_addresses}
    }
    total_logs = db.logs.count_documents(log_filter)
    print(f"[DEBUG] total_logs query: {log_filter} -> count = {total_logs}")

    # Active sources (logs in last 5 minutes)
    active_filter = {**log_filter, "timestamp": {"$gte": five_min_ago}}
    active_sources = db.logs.distinct("source", active_filter)
    active_count = len(active_sources)
    print(f"[DEBUG] active_sources: {active_sources}, count = {active_count}")
    
    # Anomalies count
    resource_ids = [r["_id"] for r in user_resources]
    anomaly_filter = {"timestamp": {"$gte": cutoff}, "resource_id": {"$in": resource_ids}}
    anomalies_count = db.anomalies.count_documents(anomaly_filter)

    return jsonify({
        "totalLogs": total_logs,
        "activeSources": active_count,
        "anomaliesCount": anomalies_count,
        "uptime": "99.9%",
        "changes": {
            "totalLogs": "0%",
            "activeSources": str(active_count),
            "anomaliesCount": str(anomalies_count),
            "uptime": "0%"
        }
    })