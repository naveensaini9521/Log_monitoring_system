import random
from datetime import datetime, timedelta

def generate_timeseries_data(hours=24):
    data = []
    now = datetime.utcnow()
    for i in range(hours):
        ts = now - timedelta(hours=hours-i)
        data.append({
            "timestamp": ts.strftime("%H:%M"),
            "logs": random.randint(800, 3500),
            "anomalies": random.randint(1, 10),
            "queries": random.randint(30, 150),
            "latency": random.randint(10, 50)
        })
    return data

def generate_service_status():
    return [
        {"name": "API Gateway", "status": "operational", "latency": 45, "uptime": 99.99, "lastChecked": "2m ago"},
        {"name": "Log Ingestion", "status": "degraded", "latency": 120, "uptime": 98.5, "lastChecked": "1m ago"},
        {"name": "AI Engine", "status": "operational", "latency": 78, "uptime": 99.8, "lastChecked": "3m ago"},
        {"name": "Database", "status": "operational", "latency": 32, "uptime": 99.95, "lastChecked": "1m ago"},
        {"name": "Message Queue", "status": "operational", "latency": 15, "uptime": 100, "lastChecked": "4m ago"}
    ]

def generate_organizations(limit=10):
    orgs = [
        {"id": "acme", "name": "Acme Corp", "userCount": 45, "logVolume": "2.4GB", "aiQueries": 340, "anomalyRate": "2.1%", "status": "active", "plan": "enterprise", "usage": 68, "quota": 100, "lastActive": "2m ago"},
        {"id": "logsentinel", "name": "LogSentinel AI", "userCount": 12, "logVolume": "850MB", "aiQueries": 120, "anomalyRate": "1.2%", "status": "active", "plan": "pro", "usage": 42, "quota": 50, "lastActive": "5m ago"},
        {"id": "cloudscale", "name": "CloudScale", "userCount": 23, "logVolume": "1.2GB", "aiQueries": 210, "anomalyRate": "3.4%", "status": "trial", "plan": "basic", "usage": 15, "quota": 20, "lastActive": "1h ago"},
        {"id": "startupx", "name": "StartupX", "userCount": 8, "logVolume": "320MB", "aiQueries": 45, "anomalyRate": "0.8%", "status": "active", "plan": "basic", "usage": 8, "quota": 10, "lastActive": "10m ago"},
        {"id": "techcorp", "name": "TechCorp Inc", "userCount": 67, "logVolume": "5.1GB", "aiQueries": 890, "anomalyRate": "4.2%", "status": "active", "plan": "enterprise", "usage": 78, "quota": 100, "lastActive": "1m ago"},
    ]
    return orgs[:limit]