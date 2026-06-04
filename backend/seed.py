from db import init_db, get_db
import bcrypt
import datetime

def hash_password(pw):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw.encode('utf-8'), salt).decode('utf-8')

def seed_organizations():
    db = get_db()
    orgs = [
        {"_id": "acme", "name": "Acme Corporation", "domain": "acme.com", "logo": "🏢", "plan": "enterprise"},
        {"_id": "techcorp", "name": "TechCorp Inc", "domain": "techcorp.com", "logo": "💻", "plan": "pro"},
        {"_id": "cloudscale", "name": "CloudScale", "domain": "cloudscale.io", "logo": "☁️", "plan": "enterprise"},
        {"_id": "startupx", "name": "StartupX", "domain": "startupx.dev", "logo": "🚀", "plan": "free"},
        {"_id": "logsentinel", "name": "LogSentinel AI", "domain": "logsentinel.ai", "logo": "🧠", "plan": "internal"}
    ]
    for org in orgs:
        if not db.organizations.find_one({"_id": org["_id"]}):
            db.organizations.insert_one(org)
    print("Organizations seeded")

def seed_demo_users():
    db = get_db()
    # Map role to organization (by domain)
    demo_users = [
        {"email": "admin@logsentinel.ai", "password": "Admin@2024", "username": "Super Admin", "role": "super_admin", "domain": "logsentinel.ai"},
        {"email": "orgadmin@acme.com", "password": "OrgAdmin@2024", "username": "Org Admin", "role": "org_admin", "domain": "acme.com"},
        {"email": "security@acme.com", "password": "Security@2024", "username": "Security Analyst", "role": "security_analyst", "domain": "acme.com"},
        {"email": "devops@acme.com", "password": "DevOps@2024", "username": "DevOps Engineer", "role": "devops_engineer", "domain": "acme.com"},
        {"email": "ai@logsentinel.ai", "password": "AI@2024", "username": "AI Analyst", "role": "ai_analyst", "domain": "logsentinel.ai"},
        {"email": "viewer@acme.com", "password": "Viewer@2024", "username": "Viewer", "role": "viewer", "domain": "acme.com"}
    ]
    permissions_map = {
        "super_admin": ["manage_system", "manage_organizations", "view_all_logs", "manage_users", "configure_ai"],
        "org_admin": ["manage_org_users", "org_settings", "view_org_logs", "manage_log_sources"],
        "security_analyst": ["real_time_monitoring", "view_security_alerts", "incident_investigation"],
        "devops_engineer": ["view_system_logs", "monitor_performance", "configure_agents"],
        "ai_analyst": ["train_models", "analyze_patterns", "create_insights"],
        "viewer": ["view_dashboards", "read_logs", "export_reports"]
    }
    for u in demo_users:
        existing = db.users.find_one({"email": u["email"]})
        if not existing:
            # Find organization by domain
            org = db.organizations.find_one({"domain": u["domain"]})
            org_id = org["_id"] if org else None
            org_name = org["name"] if org else "Individual"
            user_doc = {
                "email": u["email"],
                "password_hash": hash_password(u["password"]),
                "username": u["username"],
                "role": u["role"],
                "organization_id": org_id,
                "organization_name": org_name,
                "permissions": permissions_map.get(u["role"], []),
                "email_verified": True,
                "dob": "1990-01-01",
                "gender": "other",
                "mobile": "",
                "country": "USA",
                "reset_token": None,
                "reset_token_expiry": None,
                "created_at": datetime.datetime.utcnow(),
                "updated_at": datetime.datetime.utcnow()
            }
            db.users.insert_one(user_doc)
    print("Demo users seeded")

if __name__ == "__main__":
    init_db()
    seed_organizations()
    seed_demo_users()
    print("Seeding complete.")