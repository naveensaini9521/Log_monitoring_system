from flask import request, jsonify
from . import login_bp
from utils.decorators import login_required
from db import get_db
from bson import ObjectId

@login_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile(current_user):
    data = request.get_json()
    db = get_db()
    user_id = ObjectId(current_user['_id'])
    updates = {}
    allowed = ['name', 'email', 'notifications', 'darkMode', 'twoFactor']
    for field in allowed:
        if field in data:
            updates[field] = data[field]
    if updates:
        db.users.update_one({'_id': user_id}, {'$set': updates})
    return jsonify({'success': True, 'message': 'Profile updated'})