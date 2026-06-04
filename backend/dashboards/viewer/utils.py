# backend/dashboards/viewer/utils.py
from bson import ObjectId

def get_user_id(current_user):
    """
    Extract user ID from current_user dict.
    Handles '_id', 'id', 'user_id' keys, and converts ObjectId to string.
    """
    for key in ['_id', 'id', 'user_id', 'userId']:
        if key in current_user:
            val = current_user[key]
            if isinstance(val, ObjectId):
                return str(val)
            return val
    # Fallback: try to get from session? Or raise a clear error.
    raise KeyError(f"No recognized user ID key in {list(current_user.keys())}")