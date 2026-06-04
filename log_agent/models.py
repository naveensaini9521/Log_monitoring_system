from pydantic import BaseModel
from typing import Optional, List


class Application(BaseModel):
    name: str
    long: str

    # Application metadata
    github_repo: Optional[str] = None
    app_path: Optional[str] = None
    language: Optional[str] = None

    # Log configuration
    log_file: str

    enabled: bool = True
    verbosity: int = 1
    cron: str

    last_offset: Optional[int] = 0


class ApplicationResponse(BaseModel):
    message: str


class ApplicationList(BaseModel):
    count: int
    applications: List[str]


class IngestPayload(BaseModel):
    service: str
    host: Optional[str] = None
    source: Optional[str] = None
    logs: List[str]


class LogEntry(BaseModel):

    service: str
    level: str
    message: str

    timestamp: Optional[str] = None
    trace_id: Optional[str] = None

    application: Optional[str] = None
    log_file: Optional[str] = None
    github_repo: Optional[str] = None