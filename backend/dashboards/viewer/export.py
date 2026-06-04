# backend/dashboards/viewer/export.py
from flask import jsonify, request, make_response
from . import viewer_bp
from utils.decorators import role_required
from db import get_db
import csv
import io
from datetime import datetime, timedelta

@viewer_bp.route('/export', methods=['POST'])
@role_required(['viewer', 'super_admin', 'org_admin', 'security_analyst', 'devops_engineer', 'ai_analyst'])
def export_data(current_user):
    data = request.get_json()
    export_type = data.get('type', 'logs')
    format_type = data.get('format', 'csv')
    time_range = data.get('timeRange', '24h')
    service = data.get('service')  # service can be None or string
    
    db = get_db()
    hours = 24 if time_range == '24h' else 168 if time_range == '7d' else 720
    since = datetime.utcnow() - timedelta(hours=hours)
    
    if export_type == 'logs':
        query = {"timestamp": {"$gte": since}}
        if service and service != 'null':
            query["source"] = service
        cursor = db.logs.find(query).limit(10000)
        fields = ['timestamp', 'source', 'message', 'severity', 'user_id']
        data_list = list(cursor)
    else:
        # reports export (optional)
        cursor = db.reports.find({})
        fields = ['name', 'type', 'date', 'size']
        data_list = list(cursor)
    
    if format_type == 'csv':
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        for row in data_list:
            row['_id'] = str(row['_id']) if '_id' in row else None
            writer.writerow({k: row.get(k, '') for k in fields})
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=export_{export_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        return response
    else:
        for row in data_list:
            row['_id'] = str(row['_id'])
        return jsonify(data_list)