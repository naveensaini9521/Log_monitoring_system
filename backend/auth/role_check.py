from functools import wraps
from flask import jsonify, session

def role_required(allowed_roles):
    """Decorator to check if logged-in user has one of the allowed roles."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_role = session.get('role')
            if not user_role:
                return jsonify({"success": False, "message": "Authentication required"}), 401
            if user_role not in allowed_roles:
                return jsonify({"success": False, "message": f"Access denied. Required role: {allowed_roles}"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator