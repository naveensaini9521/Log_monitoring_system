from flask import Blueprint, request, jsonify, session
import re
import datetime
import logging
from db import get_db
from .auth_helpers import hash_password, assign_organization

register_bp = Blueprint('register', __name__)
logger = logging.getLogger(__name__)

@register_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid JSON body"}), 400

        email = data.get("email")
        password = data.get("password")
        username = data.get("username")
        role = data.get("role", "viewer")
        dob = data.get("dob")
        gender = data.get("gender")
        mobile = data.get("mobile")
        country = data.get("country")

        # ---------- Validation ----------
        if not email or not password or not username:
            return jsonify({"success": False, "message": "Email, password and username required"}), 400
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return jsonify({"success": False, "message": "Invalid email format"}), 400
        if len(password) < 8:
            return jsonify({"success": False, "message": "Password must be at least 8 characters"}), 400
        allowed_roles = ["super_admin", "org_admin", "security_analyst", "devops_engineer", "ai_analyst", "viewer"]
        if role not in allowed_roles:
            return jsonify({"success": False, "message": "Invalid role"}), 400

        db = get_db()
        if db.users.find_one({"email": email}):
            return jsonify({"success": False, "message": "User already exists"}), 409

        # ---------- Organization assignment (with try/except) ----------
        try:
            org_id, org_name = assign_organization(email, role)
            # Ensure org_id is a string (or None)
            if org_id is not None:
                org_id = str(org_id)
        except Exception as e:
            logger.error(f"Organization assignment failed: {str(e)}")
            return jsonify({"success": False, "message": "Internal error assigning organization"}), 500

        # ---------- Permissions ----------
        permissions_map = {
            "super_admin": ["manage_system", "manage_organizations", "view_all_logs", "manage_users", "configure_ai"],
            "org_admin": ["manage_org_users", "org_settings", "view_org_logs", "manage_log_sources"],
            "security_analyst": ["real_time_monitoring", "view_security_alerts", "incident_investigation"],
            "devops_engineer": ["view_system_logs", "monitor_performance", "configure_agents"],
            "ai_analyst": ["train_models", "analyze_patterns", "create_insights"],
            "viewer": ["view_dashboards", "read_logs", "export_reports"]
        }
        permissions = permissions_map.get(role, [])

        # ---------- Create user ----------
        new_user = {
            "email": email,
            "password_hash": hash_password(password),
            "username": username,
            "role": role,
            "organization_id": org_id,
            "organization_name": org_name,
            "dob": dob,
            "gender": gender,
            "mobile": mobile,
            "country": country,
            "permissions": permissions,
            "email_verified": False,
            "reset_token": None,
            "reset_token_expiry": None,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }

        result = db.users.insert_one(new_user)

        # Auto-login after registration
        session['user_id'] = str(result.inserted_id)
        session['email'] = email
        session['role'] = role
        session['organization_id'] = org_id
        session.permanent = True

        return jsonify({
            "success": True,
            "user": {
                "id": str(result.inserted_id),
                "email": email,
                "name": username,
                "role": role,
                "organization": org_name,
                "permissions": permissions
            }
        }), 201

    except Exception as e:
        logger.exception("Unexpected error in register endpoint")
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500