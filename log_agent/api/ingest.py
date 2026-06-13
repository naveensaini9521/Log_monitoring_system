import sys
import os
from fastapi import APIRouter, Header, HTTPException
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
sys.path.append(BASE_DIR)

from log_agent.db import logs, applications, db
from log_agent.models import IngestPayload

router = APIRouter()

API_KEYS = os.getenv("INGEST_API_KEYS", "").split(",")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key not in API_KEYS:
        raise HTTPException(403, "Invalid API Key")
    return x_api_key

@router.post("/ingest")
async def ingest_log(payload: IngestPayload):
    service_name = payload.service
    log_lines = payload.logs

    if not service_name or not log_lines:
        raise HTTPException(400, "service and logs are required")

    # optional app lookup (does not affect storage)
    app = await applications.find_one({"$or": [{"log_file": service_name}, {"name": service_name}]})
    resolved_service = app["name"] if app else service_name

    # Update resource status in Flask's DB (make it "healthy")
    resource = await db.user_resources.find_one({
        "$or": [{"address": service_name}, {"name": service_name}]
    })
    if resource:
        await db.user_resources.update_one(
            {"_id": resource["_id"]},
            {"$set": {"status": "healthy", "last_seen": datetime.utcnow()}}
        )
        print(f"Resource {resource.get('name')} is now healthy")

    # Store logs
    docs = []
    for line in log_lines:
        level = "INFO"
        if "ERROR" in line: level = "ERROR"
        elif "WARN" in line: level = "WARN"
        elif "DEBUG" in line: level = "DEBUG"

        docs.append({
            "service": resolved_service,
            "level": level,
            "message": line,
            "timestamp": datetime.utcnow(),
            "application": resolved_service,
            "log_file": service_name,
            "source": service_name
        })
    result = await logs.insert_many(docs)
    return {"message": "Ingested", "count": len(result.inserted_ids), "service": resolved_service}