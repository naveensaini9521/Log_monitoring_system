from fastapi import APIRouter
from log_agent.schema import logs

router = APIRouter(prefix="/api/logs", tags=["Logs"])


@router.get("/{service}")
async def get_logs(service: str):

    cursor = logs.find({"service": service}).sort("timestamp", -1).limit(100)

    results = []

    async for log in cursor:
        log["_id"] = str(log["_id"])
        results.append(log)

    return {
        "service": service,
        "count": len(results),
        "logs": results
    }