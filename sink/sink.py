import argparse
import requests
import json
import os
import time
import socket

OFFSET_FILE = "offset.json"

def load_offsets():
    if not os.path.exists(OFFSET_FILE):
        return {}
    try:
        with open(OFFSET_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_offsets(offsets):
    with open(OFFSET_FILE, "w") as f:
        json.dump(offsets, f, indent=2)

def send_chunk(chunk, url, service, api_key=None, retries=3):
    logs = [line.strip() for line in chunk if line.strip()]
    if not logs:
        return True

    payload = {
        "service": service,
        "host": socket.gethostname(),
        "source": "sink-agent",
        "logs": logs
    }
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["X-API-Key"] = api_key

    for attempt in range(retries):
        try:
            resp = requests.post(url, json=payload, headers=headers)
            if resp.status_code in (200, 201):
                return True
            else:
                print(f"Failed (status {resp.status_code}): {resp.text}")
        except Exception as e:
            print(f"Request error: {e}")
        time.sleep(2)
    return False

def process_file(file_path, chunk_size, url, offsets, custom_service=None, api_key=None):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    service = custom_service if custom_service else file_path
    last_line = offsets.get(file_path, 0)

    with open(file_path, "r") as f:
        lines = f.readlines()

    total = len(lines)
    if last_line >= total:
        print(f"{file_path} already fully processed")
        return

    print(f"Starting from line {last_line} for service '{service}'")
    while last_line < total:
        chunk = lines[last_line:last_line + chunk_size]
        success = send_chunk(chunk, url, service, api_key)
        if success:
            print(f"Sent lines {last_line} → {last_line + len(chunk)}")
        else:
            print(f"Failed, stopping at line {last_line}")
            break
        last_line += len(chunk)
        offsets[file_path] = last_line
        save_offsets(offsets)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", required=True)
    parser.add_argument("--lines", type=int, default=10)
    parser.add_argument("--url", default="http://127.0.0.1:8000/api/ingest")
    parser.add_argument("--service", default=None)
    parser.add_argument("--api-key", dest="api_key", default=None)   # note: dest="api_key"
    args = parser.parse_args()

    offsets = load_offsets()
    for f in args.files:
        print(f"\nProcessing {f}")
        process_file(f, args.lines, args.url, offsets, args.service, args.api_key)