# backend/dashboards/viewer/dashboards.py (excerpt)
from flask import jsonify, request
from . import viewer_bp
from utils.decorators import role_required
from db import get_db

@viewer_bp.route('/dashboards/popular', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def get_popular_dashboards(current_user):
    db = get_db()
    service = request.args.get('service')
    # For simplicity, we still return mock data; but you could filter by service if dashboards have a 'service' field
    dashboards = [
        {"name": "System Overview", "views": 234, "lastUpdated": "5 min ago"},
        {"name": "Security Monitoring", "views": 189, "lastUpdated": "2 min ago"},
        {"name": "Application Metrics", "views": 156, "lastUpdated": "10 min ago"}
    ]
    return jsonify(dashboards)