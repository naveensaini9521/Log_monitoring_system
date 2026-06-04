from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

metrics_bp = Blueprint('devops_metrics', __name__)

@metrics_bp.route('/metrics', methods=['GET'])
@login_required
@role_required(['devops_engineer', 'super_admin'])
def get_metrics():
    return jsonify({
        "success": True,
        "data": {
            "activeNodes": 24,
            "logProcessingRate": "234k/sec",
            "avgResponseTime": 124,
            "errorRate": 0.02
        }
    })