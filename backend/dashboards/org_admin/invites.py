from flask import Blueprint, request, jsonify
from auth.login import login_required
from auth.role_check import role_required

invites_bp = Blueprint('org_invites', __name__)

@invites_bp.route('/invite', methods=['POST'])
@login_required
@role_required(['org_admin', 'super_admin'])
def invite_member():
    data = request.get_json()
    email = data.get('email')
    role = data.get('role')
    # Mock – store invitation in DB and send email
    return jsonify({"success": True, "message": f"Invitation sent to {email}"})