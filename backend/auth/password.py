# backend/auth/password.py
from flask import request, jsonify
import datetime
from db import get_db
from .auth_helpers import generate_reset_token
from werkzeug.security import generate_password_hash
from .login import login_bp   # assuming login_bp exists in __init__.py
from utils.decorators import login_required

@login_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email required"}), 400

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        # Do not reveal non‑existence
        return jsonify({"success": True, "message": "If the email exists, a reset link has been sent"})

    token = generate_reset_token()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": token, "reset_token_expiry": expiry}}
    )

    reset_link = f"http://localhost:5173/reset-password?token={token}"
    print(f"Password reset link for {email}: {reset_link}")
    # TODO: send real email

    return jsonify({"success": True, "message": "Password reset link sent to your email"})

@login_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"success": False, "message": "Token and new password required"}), 400
    if len(new_password) < 8:
        return jsonify({"success": False, "message": "Password must be at least 8 characters"}), 400

    db = get_db()
    user = db.users.find_one({
        "reset_token": token,
        "reset_token_expiry": {"$gt": datetime.datetime.utcnow()}
    })
    if not user:
        return jsonify({"success": False, "message": "Invalid or expired reset token"}), 400

    hashed = generate_password_hash(new_password)   # using werkzeug
    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed, "reset_token": None, "reset_token_expiry": None}}  # field name "password"
    )
    return jsonify({"success": True, "message": "Password updated successfully"})

@login_bp.route('/change-password', methods=['POST'])
@login_required
def change_password(current_user):
    data = request.get_json()
    current = data.get('currentPassword')
    new = data.get('newPassword')
    if not current or not new:
        return jsonify({"error": "Current and new password required"}), 400
    if len(new) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    from werkzeug.security import check_password_hash, generate_password_hash
    user = db.users.find_one({"_id": current_user["_id"]})
    if not user or not check_password_hash(user.get("password", ""), current):
        return jsonify({"error": "Current password is incorrect"}), 401

    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": generate_password_hash(new)}}
    )
    return jsonify({"success": True, "message": "Password changed"})