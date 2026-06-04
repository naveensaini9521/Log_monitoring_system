# backend/dashboards/viewer/quick_view.py
from flask import jsonify, request
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
from datetime import datetime, timedelta

@viewer_bp.route('/quick-view', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def get_quick_view(current_user):
    db = get_db()
    service = request.args.get('service')
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    
    base_filter = {"timestamp": {"$gte": yesterday}}
    if service and service != 'null':
        base_filter["source"] = service
    
    log_volume = db.logs.count_documents(base_filter)
    active_users = len(db.logs.distinct("user_id", base_filter))
    
    security_filter = {**base_filter, "severity": {"$in": ["high", "critical"]}}
    security_events = db.logs.count_documents(security_filter)
    
    # Format log volume
    if log_volume >= 1_000_000:
        log_volume_str = f"{log_volume/1_000_000:.1f}M"
    else:
        log_volume_str = f"{log_volume/1000:.1f}K"
    
    return jsonify({
        "logVolume": log_volume_str,
        "activeUsers": active_users,
        "securityEvents": security_events,
        "changes": {
            "logVolume": "+12%",
            "activeUsers": "+8%",
            "securityEvents": "-3%"
        }
    })