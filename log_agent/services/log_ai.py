def detect_anomaly(log):
    
    message = log["message"].lower()
    
    if "exception" in message:
        return "EXCEPTION"
    
    if "timeout" in message:
        return "TIMEOUT"
    
    if "connection refused" in message:
        return "NETWORK_ERROR"
    
    return None