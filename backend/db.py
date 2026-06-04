from pymongo import MongoClient
from config import Config

client = None
db = None

def init_db():
    global client, db
    try:
        client = MongoClient(Config.MONGO_URI)
        db = client[Config.DB_NAME]
        client.admin.command('ping')
        print("Connected to MongoDB")
        return db
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise

def get_db():
    global db
    if db is None:
        init_db()
    return db