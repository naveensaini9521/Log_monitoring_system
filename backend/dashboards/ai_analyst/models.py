from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

ai_models_analyst_bp = Blueprint('ai_analyst_models', __name__)

@ai_models_analyst_bp.route('/models', methods=['GET'])
@login_required
@role_required(['ai_analyst', 'super_admin'])
def get_models():
    models = [
        {"name": "Anomaly Detector", "version": "2.1.0", "accuracy": 96.2, "status": "active", "latency": 45},
        {"name": "Log Classifier", "version": "1.5.0", "accuracy": 91.8, "status": "active", "latency": 67}
    ]
    return jsonify({"success": True, "data": models})