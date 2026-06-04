REQUIRED_FIELDS = ["level", "message", "source", "service", "host"]

def validate_log_payload(payload: dict):
    missing = [f for f in REQUIRED_FIELDS if f not in payload]
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    return True, None