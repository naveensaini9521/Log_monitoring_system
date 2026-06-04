from datetime import datetime
from extensions import mongo
from services.validator import validate_log_payload

def create_log(payload: dict):
    valid, error = validate_log_payload(payload)
    if not valid:
        raise ValueError(error)

    log_doc = {
        "level": payload["level"],
        "message": payload["message"],
        "source": payload.get("source"),
        "service": payload.get("service"),
        "host": payload.get("host"),
        "timestamp": payload.get("timestamp", datetime.utcnow())
    }

    result = mongo.db.logs.insert_one(log_doc)
    return str(result.inserted_id)

def get_logs(filters: dict, page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    cursor = (
        mongo.db.logs
        .find(filters)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    logs = list(cursor)
    for log in logs:
        log["_id"] = str(log["_id"])

    total = mongo.db.logs.count_documents(filters)
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": logs
    }