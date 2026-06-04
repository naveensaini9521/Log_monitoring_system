from fastapi import APIRouter, HTTPException
from db import applications
from models import Application, ApplicationResponse, ApplicationList
from scheduler import schedule_job

router = APIRouter()


@router.post("/applications", response_model=ApplicationResponse)
def create_application(app_data: Application):

    data = app_data.dict()
    data["last_offset"] = 0

    existing = applications.find_one({"name": data["name"]})

    if existing:
        raise HTTPException(status_code=400, detail="Application already exists")

    applications.insert_one(data)

    schedule_job(data)

    return {"message": "Application created successfully"}


@router.get("/applications", response_model=ApplicationList)
def list_applications():

    apps = list(applications.find({}, {"_id": 0}))

    return {
        "count": len(apps),
        "applications": apps
    }


@router.put("/applications/{name}/enable", response_model=ApplicationResponse)
def enable_application(name: str):

    result = applications.update_one(
        {"name": name},
        {"$set": {"enabled": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Application enabled"}


@router.put("/applications/{name}/disable", response_model=ApplicationResponse)
def disable_application(name: str):

    result = applications.update_one(
        {"name": name},
        {"$set": {"enabled": False}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Application disabled"}