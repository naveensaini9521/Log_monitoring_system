
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../central-server")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routes import router as main_router          
from api.logs import router as logs_router       
from scheduler import start_scheduler
from api.ingest import router as ingest_router
from api.live_logs import router as live_logs_router

app = FastAPI(title="Log Agent Microservice")
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(main_router)
app.include_router(logs_router)
app.include_router(ingest_router, prefix="/api")
app.include_router(live_logs_router)

@app.on_event("startup")
def startup():
    print("Starting Log Agent service...")
    start_scheduler()

@app.get("/")
def health():
    return {"status": "log-agent running"}