def detect_error(message):

    patterns = [
        "exception",
        "failed",
        "traceback",
        "error",
        "timeout"
    ]

    msg = message.lower()

    for p in patterns:
        if p in msg:
            return True

    return False