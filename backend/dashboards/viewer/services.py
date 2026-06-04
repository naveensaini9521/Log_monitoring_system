# backend/dashboards/viewer/services.py
from flask import jsonify
from . import viewer_bp
from utils.decorators import role_required
from db import get_db

@viewer_bp.route('/services', methods=['GET'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def get_available_services(current_user):
    db = get_db()
    # Get distinct services from logs (field 'source') and from applications (field 'name')
    log_services = db.logs.distinct("source")
    app_services = db.applications.distinct("name")
    all_services = sorted(set(log_services + app_services))
    return jsonify({"services": all_services})