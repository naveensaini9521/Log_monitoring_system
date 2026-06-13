# backend/utils/decorators.py
from functools import wraps
from flask import request, jsonify, current_app, session
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        # ✅ Get secret key from current Flask app config
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            return jsonify({'message': 'Server configuration error'}), 500

        try:
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            email = data.get('email')
            if not email:
                return jsonify({'message': 'Invalid token payload'}), 401

            # ✅ Lazy import to avoid circular issues
            from auth import USERS_DB
            current_user = USERS_DB.get(email)
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated



def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_role = session.get('role')
            if not user_role:
                return jsonify({"success": False, "message": "Authentication required"}), 401
            if user_role not in allowed_roles:
                return jsonify({"success": False, "message": "Access denied"}), 403
            # Pass current_user if needed
            current_user = {
                "id": session.get('user_id'),
                "role": user_role,
                "email": session.get('email')
            }
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
