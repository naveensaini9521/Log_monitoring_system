from flask import Blueprint, request, jsonify, session
from functools import wraps
import logging
from db import get_db                 
from .auth_helpers import check_password   

login_bp = Blueprint('login', __name__)
logger = logging.getLogger(__name__)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"success": False, "message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated

@login_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400

        email = data.get("email")
        password = data.get("password")
        selected_role = data.get("role")      # optional

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password required"}), 400

        db = get_db()
        user = db.users.find_one({"email": email})
        if not user or not check_password(password, user["password_hash"]):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        if selected_role and user["role"] != selected_role:
            return jsonify({"success": False, "message": f"You are not a {selected_role}"}), 403

        session['user_id'] = str(user["_id"])
        session['email'] = user["email"]
        session['role'] = user["role"]
        session['organization_id'] = str(user["organization_id"]) if user.get("organization_id") else None
        session.permanent = True

        return jsonify({
            "success": True,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("username", user["email"]),
                "role": user["role"],
                "organization": user.get("organization_name", "Individual"),
                "permissions": user.get("permissions", [])
            }
        })
    except Exception as e:
        logger.exception("Login error")
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500

@login_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})

@login_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    try:
        user_id = session['user_id']
        db = get_db()
        from bson import ObjectId
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            session.clear()
            return jsonify({"success": False, "message": "User not found"}), 401
        return jsonify({
            "success": True,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("username", user["email"]),
                "role": user["role"],
                "organization": user.get("organization_name", "Individual"),
                "permissions": user.get("permissions", [])
            }
        })
    except Exception as e:
        logger.exception("Error in /me endpoint")
        return jsonify({"success": False, "message": str(e)}), 500