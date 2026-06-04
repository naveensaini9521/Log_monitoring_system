from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

log_sources_bp = Blueprint('org_log_sources', __name__)

@log_sources_bp.route('/log-sources', methods=['GET'])
@login_required
@role_required(['org_admin', 'super_admin'])
def get_log_sources():
    sources = [
        {"name": "Production Servers", "type": "Server", "logs": "234k", "status": "healthy"},
        {"name": "Application Logs", "type": "App", "logs": "892k", "status": "healthy"},
        {"name": "Security Events", "type": "Security", "logs": "45k", "status": "warning"},
        {"name": "Database Queries", "type": "Database", "logs": "567k", "status": "healthy"}
    ]
    return jsonify({"success": True, "data": sources})