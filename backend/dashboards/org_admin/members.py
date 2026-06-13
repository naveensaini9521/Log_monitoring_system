from flask import Blueprint, jsonify, session
from auth.login import login_required
from auth.role_check import role_required

org_members_bp = Blueprint('org_members', __name__)

@org_members_bp.route('/members', methods=['GET'])
@login_required
@role_required(['org_admin', 'super_admin'])
def get_members():
    org_id = session.get('organization_id')
    # Mock data – replace with DB query for users in this organization
    members = [
        {"name": "John Smith", "role": "security_analyst", "status": "active", "lastActive": "5 min ago"},
        {"name": "Sarah Johnson", "role": "developer", "status": "active", "lastActive": "2 min ago"},
        {"name": "Mike Wilson", "role": "viewer", "status": "away", "lastActive": "1 hour ago"},
        {"name": "Emily Brown", "role": "security_analyst", "status": "offline", "lastActive": "1 day ago"}
    ]
    return jsonify({"success": True, "data": members})