from flask import Blueprint, jsonify, request
from auth.login import login_required
from auth.role_check import role_required

incidents_bp = Blueprint('security_incidents', __name__)

@incidents_bp.route('/incidents', methods=['GET'])
@login_required
@role_required(['security_analyst', 'super_admin'])
def get_incidents():
    status = request.args.get('status', 'active')
    incidents = [
        {"id": "inc_001", "title": "Data breach investigation", "priority": "high", "status": "investigating", "severity": "high", "timestamp": "2026-04-15T09:00:00Z"},
        {"id": "inc_002", "title": "Malware detected on endpoint", "priority": "critical", "status": "triage", "severity": "critical", "timestamp": "2026-04-15T10:45:00Z"}
    ]
    if status == "active":
        incidents = [i for i in incidents if i["status"] != "resolved"]
    return jsonify({"success": True, "data": incidents})

@incidents_bp.route('/incident/<incident_id>/details', methods=['GET'])
@login_required
@role_required(['security_analyst', 'super_admin'])
def get_incident_details(incident_id):
    # Mock details
    return jsonify({"success": True, "data": {"id": incident_id, "details": "Full investigation data here"}})