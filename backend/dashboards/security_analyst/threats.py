from flask import Blueprint, jsonify, request
from auth.login import login_required
from auth.role_check import role_required

threats_bp = Blueprint('security_threats', __name__)

@threats_bp.route('/threats', methods=['GET'])
@login_required
@role_required(['security_analyst', 'super_admin'])
def get_threats():
    limit = request.args.get('limit', 10, type=int)
    threats = [
        {"id": "thr_001", "title": "Suspicious outbound traffic", "severity": "high", "status": "investigating", "description": "Unusual data exfiltration patterns detected", "source": "Firewall", "timestamp": "2026-04-15T10:30:00Z", "aiConfidence": 92, "affected": ["web-server-01", "db-02"]},
        {"id": "thr_002", "title": "Brute force login attempt", "severity": "critical", "status": "new", "description": "Multiple failed logins from external IP", "source": "Auth Service", "timestamp": "2026-04-15T11:15:00Z", "aiConfidence": 98, "affected": ["auth-api"]}
    ]
    return jsonify({"success": True, "data": threats[:limit]})