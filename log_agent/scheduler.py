from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from schema import applications
from log_reader import read_logs
from sender import send_logs

import os  

scheduler = BackgroundScheduler(timezone="UTC")

import os

INGEST_API = os.getenv("INGEST_API", "http://127.0.0.1:8000/api/ingest")

def scrape_logs(app_name):

    app_doc = applications.find_one({"name": app_name})

    if not app_doc:
        print(f"Application {app_name} not found")
        return

    if not app_doc.get("enabled", True):
        print(f"Logging disabled for {app_name}")
        return

    log_file = app_doc.get("log_file")
    offset = app_doc.get("last_offset", 0)

    if not log_file or not os.path.exists(log_file):
        print(f"Invalid log path: {log_file}")
        return

    try:
        logs, new_offset = read_logs(log_file, offset)

    except Exception as e:
        print(f"Error reading log file {log_file}: {e}")
        return

    if not logs:
        print(f"No new logs for {app_name}")
        return

    print(f"Sending logs for {app_name}")

    send_logs(INGEST_API, app_name, logs)

    applications.update_one(
        {"name": app_name},
        {"$set": {"last_offset": new_offset}}
    )


def schedule_job(app_doc):

    cron_expr = app_doc.get("cron")
    app_name = app_doc.get("name")

    if not cron_expr:
        print(f"No cron defined for {app_name}")
        return

    try:
        trigger = CronTrigger.from_crontab(cron_expr)

        scheduler.add_job(
            scrape_logs,
            trigger,
            args=[app_name],
            id=app_name,
            replace_existing=True
        )

        print(f"Cron job scheduled for {app_name} -> {cron_expr}")

    except Exception as e:
        print(f"Invalid cron expression for {app_name}: {cron_expr}")
        print(e)


def start_scheduler():

    print("Starting scheduler...")

    scheduler.start()

    for app_doc in applications.find():
        schedule_job(app_doc)

    print("Scheduler started successfully")