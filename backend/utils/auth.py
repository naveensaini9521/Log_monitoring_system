# backend/utils/auth.py
from db import get_db

def get_user_id_from_session(session):
    """Extract user_id from session (email/username lookup)."""
    email = session.get('email')
    if not email:
        return None
    db = get_db()
    user = db.users.find_one({'email': email}, {'_id': 1})
    return user['_id'] if user else None