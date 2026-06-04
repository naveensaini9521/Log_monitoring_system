import os
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/logsdb")

sync_client = MongoClient(MONGO_URI)
sync_db = sync_client.get_default_database()
applications = sync_db["applications"]

async_client = AsyncIOMotorClient(MONGO_URI)
async_db = async_client.get_default_database()
logs = async_db["logs"]   

try:
    sync_client.admin.command("ping")
    print("MongoDB connected successfully")
except Exception as e:
    print("MongoDB connection failed:", e)