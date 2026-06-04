from flask import Blueprint, request, jsonify
from auth.login import login_required
from auth.role_check import role_required

threat_hunt_bp = Blueprint('threat_hunt', __name__)

@threat_hunt_bp.route('/threat-hunt', methods=['POST'])
@login_required
@role_required(['security_analyst', 'super_admin'])
def run_threat_hunt():
    data = request.get_json()
    hunt_type = data.get('type', 'ai_assisted')
    timeframe = data.get('timeframe', '24h')
    # Simulate async job
    return jsonify({"success": True, "message": f"Threat hunt started (type={hunt_type}, timeframe={timeframe})", "job_id": "hunt_123"})