from flask import jsonify, request
from . import super_admin_bp
from utils.decorators import role_required
from datetime import datetime, timedelta

@super_admin_bp.route('/analytics', methods=['GET'])
@role_required(['super_admin'])
def get_global_analytics(current_user):
    time_range = request.args.get('timeRange', '24h')
    hours = 24 if time_range == '24h' else 168 if time_range == '7d' else 720
    # generate mock time series
    now = datetime.utcnow()
    points = []
    for i in range(hours, -1, -4):
        ts = now - timedelta(hours=i)
        points.append({
            "timestamp": ts.isoformat() + "Z",
            "logs": 12000 + i * 300,
            "anomalies": 5 + i // 2,
            "queries": 800 + i * 20,
            "latency": 120 + i // 3
        })
    return jsonify({
        "ingestionRate": "1250/sec",
        "rateChange": "+12%",
        "totalLogs": "45.2M",
        "todayLogs": "1.2M",
        "anomalies": 23,
        "anomalyChange": "-5%",
        "topSources": [
            {"name": "Application", "count": 45000, "percentage": 35},
            {"name": "System", "count": 32000, "percentage": 25},
            {"name": "Security", "count": 18000, "percentage": 14},
            {"name": "Database", "count": 15000, "percentage": 12},
            {"name": "Network", "count": 8000, "percentage": 6}
        ],
        "timeSeriesData": points,
        "geoDistribution": []
    })