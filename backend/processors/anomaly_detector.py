# processors/anomaly_detector.py
from db import get_db
from datetime import datetime, timedelta

def check_resources():
    db = get_db()
    # Get all resources
    resources = list(db.user_resources.find())
    for res in resources:
        # Count errors in last hour
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        error_logs = db.logs.count_documents({
            "source": res["address"],
            "timestamp": {"$gte": one_hour_ago},
            "level": "ERROR"
        })
        if error_logs > 10:  # threshold
            db.anomalies.insert_one({
                "resource_id": res["_id"],
                "resourceId": str(res["_id"]),
                "message": f"High error count ({error_logs}) in last hour",
                "severity": "high",
                "timestamp": datetime.utcnow(),
                "recommendation": "Check application logs"
            })