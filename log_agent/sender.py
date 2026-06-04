import requests

def send_logs(INGEST_API, app_name, logs):

    payload = {
        "source": "log-agent",
        "service": app_name,
        "host": "localhost",
        "logs": logs
    }

    try:
        response = requests.post(INGEST_API, json=payload)
        print(f"Logs sent → status {response.status_code}")
        print("Response:", response.text)
        
    except Exception as e:
        print(f"Failed to send logs: {e}")