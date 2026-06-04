from flask import jsonify
from . import super_admin_bp
from utils.decorators import role_required

@super_admin_bp.route('/ai/models/status', methods=['GET'])
@role_required(['super_admin'])
def get_ai_model_status(current_user):
    return jsonify({
        "overallAccuracy": 94.7,
        "accuracyChange": 1.2,
        "precision": 93.2,
        "recall": 95.1,
        "models": [
            {"name": "Anomaly Detector", "version": "2.1.0", "accuracy": 96.2, "status": "active", "latency": 45, "requestsPerMinute": 2340},
            {"name": "Log Classifier", "version": "1.5.0", "accuracy": 91.8, "status": "active", "latency": 67, "requestsPerMinute": 1890},
            {"name": "Threat Predictor", "version": "3.0.0", "accuracy": 94.5, "status": "training", "latency": 120, "requestsPerMinute": 0}
        ],
        "trainingJobs": [
            {"id": "job_001", "model": "Threat Predictor", "progress": 67, "status": "running", "startTime": "2026-04-15T08:00:00Z", "eta": "2026-04-15T14:30:00Z"}
        ]
    })