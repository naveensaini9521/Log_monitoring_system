from fastapi import APIRouter
from log_agent.db import logs
from urllib.parse import unquote
import asyncio

router = APIRouter(prefix="/api/logs", tags=["Logs"])

@router.get("/{service:path}")
async def get_logs(service: str):
    # Decode URL‑encoded characters (e.g., %3A → :)
    service = unquote(service)
    # Sort by timestamp descending (newest first)
    cursor = logs.find({"service": service}).sort("timestamp", -1).limit(200)
    results = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        # Ensure timestamp is serializable (already a string, but safe)
        if hasattr(log["timestamp"], "isoformat"):
            log["timestamp"] = log["timestamp"].isoformat()
        results.append(log)
    return {
        "service": service,
        "count": len(results),
        "logs": results
    }