from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

clusters_bp = Blueprint('devops_clusters', __name__)

@clusters_bp.route('/clusters', methods=['GET'])
@login_required
@role_required(['devops_engineer', 'super_admin'])
def get_clusters():
    clusters = [
        {"name": "Production", "status": "healthy", "nodes": 12, "cpu": 64, "memory": 72, "latency": 98, "logs": "1.2M/min", "errors": 23},
        {"name": "Staging", "status": "healthy", "nodes": 6, "cpu": 32, "memory": 41, "latency": 124, "logs": "234k/min", "errors": 5},
        {"name": "Development", "status": "degraded", "nodes": 8, "cpu": 78, "memory": 84, "latency": 245, "logs": "567k/min", "errors": 67}
    ]
    return jsonify({"success": True, "data": clusters})