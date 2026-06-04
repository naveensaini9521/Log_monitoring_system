# backend/dashboards/viewer/live_logs.py
from flask import jsonify, request
from bson import ObjectId
from datetime import datetime, timedelta
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id

@viewer_bp.route('/logs/live', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_live_logs(current_user):
    resource_id = request.args.get('resourceId')
    if not resource_id:
        return jsonify({"error": "Missing resourceId"}), 400
    db = get_db()
    resource = db.user_resources.find_one({"_id": ObjectId(resource_id), "user_id": get_user_id(current_user)})
    if not resource:
        return jsonify({"error": "Unauthorized"}), 403
    since = request.args.get('since')
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
        except:
            since_dt = datetime.utcnow() - timedelta(hours=1)
    else:
        since_dt = datetime.utcnow() - timedelta(hours=1)
    logs = list(db.logs.find({
        "$or": [{"source": resource["address"]}, {"resource_id": resource_id}],
        "timestamp": {"$gte": since_dt}
    }).sort("timestamp", -1).limit(200))
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log and hasattr(log["timestamp"], "isoformat"):
            log["timestamp"] = log["timestamp"].isoformat()
    return jsonify(logs)