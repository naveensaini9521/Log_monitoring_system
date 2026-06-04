from flask import jsonify, request
from . import super_admin_bp
from utils.decorators import role_required

@super_admin_bp.route('/organizations', methods=['GET'])
@role_required(['super_admin'])
def get_organizations(current_user):
    limit = request.args.get('limit', 10, type=int)
    sort_by = request.args.get('sortBy', 'usage')
    order = request.args.get('order', 'desc')
    
    orgs = [
        {"id": "acme", "name": "Acme Corp", "userCount": 45, "logVolume": "1.2M", "aiQueries": 2340, "anomalyRate": "0.8%", "status": "active", "plan": "enterprise", "usage": 7800, "quota": 10000, "lastActive": "2026-04-15"},
        {"id": "techcorp", "name": "TechCorp Inc", "userCount": 128, "logVolume": "3.4M", "aiQueries": 5678, "anomalyRate": "1.2%", "status": "active", "plan": "pro", "usage": 12500, "quota": 20000, "lastActive": "2026-04-15"},
        {"id": "cloudscale", "name": "CloudScale", "userCount": 23, "logVolume": "456k", "aiQueries": 890, "anomalyRate": "0.3%", "status": "trial", "plan": "basic", "usage": 2300, "quota": 5000, "lastActive": "2026-04-14"}
    ]
    # sort and limit
    reverse = (order == 'desc')
    orgs.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
    orgs = orgs[:limit]
    return jsonify(orgs)   # ✅ returns array directly