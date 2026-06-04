from flask import jsonify
from . import super_admin_bp
from utils.decorators import role_required

@super_admin_bp.route('/overview', methods=['GET'])
@role_required(['super_admin'])
def get_dashboard_overview(current_user):
    """Main overview data for Super Admin dashboard."""
    return jsonify({
        "activeNodes": 8,
        "avgCpu": 42.5,
        "avgMemory": 61.2,
        "avgLatency": 34,
        "activeOrgs": 12,
        "newOrgs": 3,
        "trialOrgs": 5,
        "paidOrgs": 7,
        "ingestionRate": "1250/sec",
        "rateChange": "+12%",
        "totalLogs": "45.2M",
        "todayLogs": "1.2M",
        "anomalies": 23,
        "anomalyChange": "-5%",
        "overallAccuracy": 94.5,
        "accuracyChange": 2.3,
    })