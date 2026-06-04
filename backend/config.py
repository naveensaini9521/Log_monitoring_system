import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Session
    SESSION_COOKIE_SAMESITE = 'Lax'       
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False         
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
    DB_NAME = os.getenv('DB_NAME', 'logsentinel')