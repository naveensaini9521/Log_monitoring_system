# backend/dashboards/viewer/resources.py
from flask import jsonify, request
from bson import ObjectId
from datetime import datetime
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from .utils import get_user_id


@viewer_bp.route('/resources', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def get_resources(current_user):
    db = get_db()
    user_id = get_user_id(current_user)
    service = request.args.get('service')
    query = {"user_id": user_id}
    if service and service != 'null':
        query["service"] = service
    resources = list(db.user_resources.find(query))
    for r in resources:
        r["_id"] = str(r["_id"])
        r["user_id"] = str(r["user_id"])
    return jsonify(resources)

@viewer_bp.route('/resources', methods=['POST'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def add_resource(current_user):
    try:
        user_id = get_user_id(current_user)
    except KeyError as e:
        return jsonify({"error": f"User ID missing in session: {str(e)}"}), 401

    data = request.get_json()
    required = ["name", "type", "address"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    new_resource = {
        "user_id": user_id,
        "name": data["name"],
        "type": data["type"],
        "address": data["address"],
        "status": "pending",
        "service": data.get("service"),
        "created_at": datetime.utcnow(),
        "last_seen": None
    }
    result = db.user_resources.insert_one(new_resource)
    new_resource["_id"] = str(result.inserted_id)
    new_resource["user_id"] = str(new_resource["user_id"])
    return jsonify(new_resource), 201

@viewer_bp.route('/resources/<resource_id>', methods=['DELETE'])
@role_required(['viewer', 'super_admin', 'org_admin'])
def delete_resource(current_user, resource_id):
    db = get_db()
    result = db.user_resources.delete_one({
        "_id": ObjectId(resource_id),
        "user_id": get_user_id(current_user)
    })
    if result.deleted_count == 0:
        return jsonify({"error": "Resource not found"}), 404
    return jsonify({"message": "Deleted"}), 200