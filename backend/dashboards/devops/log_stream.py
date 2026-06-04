from flask import Blueprint, jsonify
from auth.login import login_required
from auth.role_check import role_required

log_stream_bp = Blueprint('devops_log_stream', __name__)

@log_stream_bp.route('/log-stream', methods=['GET'])
@login_required
@role_required(['devops_engineer', 'super_admin'])
def get_log_stream():
    # For real-time, use WebSocket; here return recent logs
    logs = [
        {"level": "INFO", "source": "log-processor-01", "message": "Processed 2,345 logs in 234ms", "timestamp": "2026-04-15T12:05:00Z"},
        {"level": "WARN", "source": "api-gateway-03", "message": "High latency detected (345ms)", "timestamp": "2026-04-15T12:04:30Z"},
        {"level": "DEBUG", "source": "ai-processor-02", "message": "Model inference completed", "timestamp": "2026-04-15T12:04:00Z"},
        {"level": "ERROR", "source": "database-01", "message": "Connection timeout", "timestamp": "2026-04-15T12:03:00Z"}
    ]
    return jsonify({"success": True, "data": logs})