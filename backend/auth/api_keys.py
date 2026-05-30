from flask import request, jsonify
from .login import login_bp
from utils.decorators import login_required
from db import get_db
from bson import ObjectId
import secrets
from datetime import datetime

@login_bp.route('/api-keys', methods=['GET'])
@login_required
def get_api_keys(current_user):
    db = get_db()
    keys = list(db.api_keys.find({'user_id': current_user['_id']}))
    for k in keys:
        k['id'] = str(k['_id'])
        k['created_at'] = k.get('created_at', datetime.utcnow()).isoformat()
        del k['_id']
        del k['user_id']
    return jsonify(keys)

@login_bp.route('/api-keys', methods=['POST'])
@login_required
def create_api_key(current_user):
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name required'}), 400
    db = get_db()
    key = secrets.token_urlsafe(32)
    doc = {
        'user_id': current_user['_id'],
        'name': name,
        'key': key,
        'created_at': datetime.utcnow(),
        'last_used': None
    }
    result = db.api_keys.insert_one(doc)
    return jsonify({'id': str(result.inserted_id), 'name': name, 'key': key, 'created_at': doc['created_at'].isoformat()}), 201

@login_bp.route('/api-keys/<key_id>', methods=['DELETE'])
@login_required
def revoke_api_key(current_user, key_id):
    db = get_db()
    result = db.api_keys.delete_one({'_id': ObjectId(key_id), 'user_id': current_user['_id']})
    if result.deleted_count == 0:
        return jsonify({'error': 'Key not found'}), 404
    return jsonify({'success': True})