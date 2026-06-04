# seed_viewer_data.py
from db import init_db, get_db
from datetime import datetime, timedelta
import random

init_db()
db = get_db()

# Clear old data
db.logs.drop()
db.reports.drop()
db.dashboards.drop()

# Insert logs
sources = ['api-gateway', 'auth-service', 'database', 'ai-processor']
severities = ['info', 'warning', 'error', 'critical']
for i in range(1000):
    db.logs.insert_one({
        "timestamp": datetime.utcnow() - timedelta(minutes=random.randint(0, 1440)),
        "source": random.choice(sources),
        "message": f"Sample log message {i}",
        "severity": random.choice(severities),
        "user_id": f"user_{random.randint(1,50)}"
    })

# Insert reports
report_types = ['Security', 'Performance', 'Analytics', 'Compliance']
for i in range(20):
    db.reports.insert_one({
        "name": f"Report {i+1}",
        "type": random.choice(report_types),
        "date": datetime.utcnow() - timedelta(days=random.randint(0, 30)),
        "size": f"{random.randint(1,5)}.{random.randint(0,9)} MB"
    })

# Insert dashboards
dashboards = [
    {"name": "System Overview", "views": 234, "last_updated": "5 min ago"},
    {"name": "Security Monitoring", "views": 189, "last_updated": "2 min ago"},
    {"name": "Application Metrics", "views": 156, "last_updated": "10 min ago"}
]
for d in dashboards:
    db.dashboards.insert_one(d)

print("✅ Viewer data seeded")