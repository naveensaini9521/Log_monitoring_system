# backend/websocket.py
import random
import time
import threading
from flask_socketio import emit, join_room, leave_room
from bson import ObjectId
from db import get_db

def get_user_id_from_session(session):
    """Extract user_id from session (email lookup)."""
    email = session.get('email')
    if not email:
        return None
    db = get_db()
    user = db.users.find_one({'email': email}, {'_id': 1})
    return user['_id'] if user else None

def register_socketio_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        print('WebSocket client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('WebSocket client disconnected')

    # ---------------- LIVE LOGS ROOMS ----------------
    @socketio.on('join_logs')
    def handle_join_logs(data):
        resource_id = data.get('resourceId')
        if not resource_id:
            return
        from flask import session
        db = get_db()
        user_id = get_user_id_from_session(session)
        if not user_id:
            emit('error', {'message': 'Unauthorized'})
            return
        # Verify user owns this resource
        resource = db.user_resources.find_one({
            '_id': ObjectId(resource_id),
            'user_id': user_id
        })
        if not resource:
            emit('error', {'message': 'Resource not found or access denied'})
            return
        join_room(resource_id)
        # Send last 200 logs as initial snapshot
        from datetime import datetime, timedelta
        since = datetime.utcnow() - timedelta(hours=1)
        logs = list(db.logs.find({
            '$or': [{'resource_id': resource_id}, {'source_id': resource_id}],
            'timestamp': {'$gte': since}
        }).sort('timestamp', -1).limit(200))
        for log in logs:
            log['_id'] = str(log['_id'])
            if 'timestamp' in log and hasattr(log['timestamp'], 'isoformat'):
                log['timestamp'] = log['timestamp'].isoformat()
        emit('initial_logs', logs, room=request.sid)

    @socketio.on('leave_logs')
    def handle_leave_logs(data):
        resource_id = data.get('resourceId')
        if resource_id:
            leave_room(resource_id)

    # ---------------- MONGODB CHANGE STREAM ----------------
    def start_log_change_stream():
        """Watch logs collection and emit new logs to the appropriate room."""
        db = get_db()
        # Use a pipeline to filter only insert operations
        pipeline = [{'$match': {'operationType': 'insert'}}]
        with db.logs.watch(pipeline, full_document='updateLookup') as stream:
            for change in stream:
                log = change['fullDocument']
                # Determine which resource this log belongs to
                resource_id = log.get('resource_id') or log.get('source_id')
                if resource_id:
                    # Convert ObjectId and datetime for JSON serialization
                    log['_id'] = str(log['_id'])
                    if 'timestamp' in log and hasattr(log['timestamp'], 'isoformat'):
                        log['timestamp'] = log['timestamp'].isoformat()
                    socketio.emit('new_log', log, room=str(resource_id))

    # Start the change stream thread (daemon)
    change_stream_thread = threading.Thread(target=start_log_change_stream, daemon=True)
    change_stream_thread.start()

    # ---------------- EXISTING SYSTEM HEALTH UPDATER ----------------
    def background_updater():
        while True:
            time.sleep(5)
            update = {
                "type": "system_health",
                "payload": {
                    "activeNodes": random.randint(40, 50),
                    "avgCpu": round(random.uniform(30, 70), 1),
                    "avgMemory": round(random.uniform(50, 80), 1),
                    "avgLatency": random.randint(100, 200),
                    "activeOrgs": random.randint(20, 35),
                }
            }
            socketio.emit('update', update)

    thread = threading.Thread(target=background_updater, daemon=True)
    thread.start()