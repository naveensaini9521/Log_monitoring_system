from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

training_bp = Blueprint('ai_analyst_training', __name__)

@training_bp.route('/training-jobs', methods=['GET'])
@login_required
@role_required(['ai_analyst', 'super_admin'])
def get_training_jobs():
    jobs = [
        {"id": "job_001", "model": "Threat Predictor", "progress": 67, "status": "running", "startTime": "2026-04-15T08:00:00Z", "eta": "2026-04-15T14:30:00Z"}
    ]
    return jsonify({"success": True, "data": jobs})