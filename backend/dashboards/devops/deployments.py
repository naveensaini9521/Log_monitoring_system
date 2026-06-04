from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

deployments_bp = Blueprint('devops_deployments', __name__)

@deployments_bp.route('/deployments', methods=['GET'])
@login_required
@role_required(['devops_engineer', 'super_admin'])
def get_deployments():
    deploys = [
        {"service": "log-ingestor", "version": "v2.3.1", "status": "success", "time": "5m ago", "author": "john"},
        {"service": "ai-processor", "version": "v1.5.0", "status": "success", "time": "15m ago", "author": "sarah"},
        {"service": "alert-manager", "version": "v3.0.2", "status": "failed", "time": "25m ago", "author": "mike"},
        {"service": "api-gateway", "version": "v4.1.0", "status": "success", "time": "35m ago", "author": "alex"}
    ]
    return jsonify({"success": True, "data": deploys})