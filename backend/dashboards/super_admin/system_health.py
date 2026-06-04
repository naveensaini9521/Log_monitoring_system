from flask import jsonify
from . import super_admin_bp
from utils.decorators import role_required

@super_admin_bp.route('/system-health', methods=['GET'])
@role_required(['super_admin'])
def get_system_health(current_user):
    return jsonify({
        "activeNodes": 42,
        "avgCpu": 34.5,
        "avgMemory": 67.2,
        "avgLatency": 124,
        "activeOrgs": 28,
        "newOrgs": 3,
        "trialOrgs": 12,
        "paidOrgs": 16,
        "services": [
            {"name": "API Gateway", "status": "operational", "latency": 45, "uptime": 99.99, "lastChecked": "2026-04-15T12:00:00Z"},
            {"name": "Log Ingestor", "status": "operational", "latency": 78, "uptime": 99.95, "lastChecked": "2026-04-15T12:00:00Z"},
            {"name": "AI Processor", "status": "degraded", "latency": 234, "uptime": 98.5, "lastChecked": "2026-04-15T12:00:00Z"},
            {"name": "Database", "status": "operational", "latency": 12, "uptime": 99.99, "lastChecked": "2026-04-15T12:00:00Z"}
        ],
        "incidents": [
            {"id": "INC-001", "title": "High CPU on AI nodes", "severity": "high", "status": "investigating", "service": "AI Processor", "time": "2026-04-15T11:30:00Z"}
        ]
    })