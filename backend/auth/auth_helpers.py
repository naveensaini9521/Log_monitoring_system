import bcrypt
import datetime
import secrets
from db import get_db

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def get_organization_by_domain(domain: str):
    db = get_db()
    # Ensure organizations collection exists
    if "organizations" not in db.list_collection_names():
        db.create_collection("organizations")
        # Insert a default organization for super_admin or fallback
        default_org = {
            "name": "LogSentinel AI",
            "domain": "logsentinel.ai",
            "created_at": datetime.datetime.utcnow()
        }
        db.organizations.insert_one(default_org)
    return db.organizations.find_one({"domain": domain})

def assign_organization(email: str, role: str):
    """
    Returns (organization_id, organization_name).
    - If a matching domain exists, return that org.
    - For super_admin, fallback to logsentinel.ai domain.
    - Otherwise, create a new organization based on email domain.
    - If everything fails, return (None, "Individual").
    """
    db = get_db()
    domain = email.split('@')[-1].lower()
    org = get_organization_by_domain(domain)

    if org:
        return str(org["_id"]), org["name"]

    # For super_admin, try to assign to the default logsentinel.ai org
    if role == "super_admin":
        default_org = get_organization_by_domain("logsentinel.ai")
        if default_org:
            return str(default_org["_id"]), default_org["name"]

    # No organization found – create a new one using the email domain
    org_name = domain.split('.')[0].capitalize() + " Corp"
    new_org = {
        "name": org_name,
        "domain": domain,
        "created_at": datetime.datetime.utcnow()
    }
    try:
        result = db.organizations.insert_one(new_org)
        return str(result.inserted_id), org_name
    except Exception as e:
        # Fallback to individual if insertion fails
        print(f"Failed to create organization: {e}")
        return None, "Individual"

def generate_reset_token():
    return secrets.token_urlsafe(32)