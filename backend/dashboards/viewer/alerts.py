# backend/dashboards/viewer/alerts.py
from flask import jsonify, request
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id

@viewer_bp.route('/alerts', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_alerts(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    owned_resources = list(db.user_resources.find({"user_id": user_id}, {"_id": 1}))
    if not owned_resources:
        return jsonify([])
    resource_ids = [r["_id"] for r in owned_resources]
    query = {"resource_id": {"$in": resource_ids}, "resolved": False}
    service = request.args.get('service')
    if service and service != 'null':
        query["service"] = service
    alerts = list(db.alerts.find(query).sort("created_at", -1))
    for a in alerts:
        a["_id"] = str(a["_id"])
        a["resource_id"] = str(a["resource_id"])
        if "created_at" in a and hasattr(a["created_at"], "isoformat"):
            a["created_at"] = a["created_at"].isoformat()
    return jsonify(alerts)