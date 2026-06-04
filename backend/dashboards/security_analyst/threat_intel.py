from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

threat_intel_bp = Blueprint('threat_intel', __name__)

@threat_intel_bp.route('/threat-intelligence', methods=['GET'])
@login_required
@role_required(['security_analyst', 'super_admin'])
def get_threat_intel():
    intel = [
        {"id": "ti_001", "indicator": "5.6.7.8", "type": "IP", "risk": "high", "confidence": 95, "tags": ["malware", "c2"]},
        {"id": "ti_002", "indicator": "malware.example.com", "type": "Domain", "risk": "critical", "confidence": 99, "tags": ["ransomware"]}
    ]
    return jsonify({"success": True, "data": intel})