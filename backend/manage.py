import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import sqlite3
import hashlib
import uuid

# Try to import Flask app - if not in path, we'll work with direct DB
try:
    from app import app, db
    from models import User, Organization, Log, Alert, AIPrediction
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("⚠️  Flask app not found, running in standalone mode")

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'logsentinel.db')

def ensure_db_dir():
    """Ensure the instance directory exists"""
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)

def init_db():
    """Initialize the database with schema"""
    print("🗄️  Initializing database...")
    ensure_db_dir()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'viewer',
            organization TEXT,
            permissions TEXT,
            avatar TEXT,
            last_active TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create organizations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS organizations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            domain TEXT UNIQUE,
            logo TEXT,
            plan TEXT DEFAULT 'free',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id TEXT PRIMARY KEY,
            timestamp TIMESTAMP,
            level TEXT,
            message TEXT,
            source TEXT,
            organization_id TEXT,
            metadata TEXT,
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    ''')
    
    # Create alerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            title TEXT,
            severity TEXT,
            description TEXT,
            status TEXT,
            source TEXT,
            organization_id TEXT,
            created_at TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    ''')
    
    # Create AI predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_predictions (
            id TEXT PRIMARY KEY,
            type TEXT,
            confidence REAL,
            prediction TEXT,
            organization_id TEXT,
            created_at TIMESTAMP,
            metadata TEXT,
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

def create_user(args):
    """Create a new user"""
    print(f"👤 Creating user: {args.email}")
    
    # Validate inputs
    if not args.email or not args.password:
        print("❌ Email and password are required")
        return
    
    # Generate password hash
    password_hash = generate_password_hash(args.password)
    user_id = str(uuid.uuid4())
    
    # Set permissions based on role
    role_permissions = {
        'super_admin': ['manage_system', 'manage_organizations', 'view_all_logs', 'manage_users', 'configure_ai', 'billing_access', 'audit_logs'],
        'org_admin': ['manage_team', 'configure_log_sources', 'manage_api_keys', 'view_org_logs', 'configure_alerts', 'manage_budgets'],
        'security_analyst': ['view_security_logs', 'investigate_incidents', 'run_ai_queries', 'create_reports', 'configure_rules', 'threat_hunting'],
        'devops_engineer': ['view_system_logs', 'monitor_performance', 'configure_agents', 'manage_integrations', 'troubleshoot_issues', 'view_metrics'],
        'ai_analyst': ['train_models', 'analyze_patterns', 'create_insights', 'configure_anomaly_detection', 'view_ai_metrics', 'export_analysis'],
        'viewer': ['view_dashboards', 'read_logs', 'export_reports', 'view_analytics', 'no_write_access']
    }
    
    permissions = json.dumps(role_permissions.get(args.role, role_permissions['viewer']))
    
    ensure_db_dir()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (id, email, password_hash, name, role, organization, permissions, last_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            args.email,
            password_hash,
            args.name or args.email.split('@')[0],
            args.role,
            args.organization,
            permissions,
            datetime.now().isoformat()
        ))
        conn.commit()
        print(f"✅ User created successfully!")
        print(f"   ID: {user_id}")
        print(f"   Email: {args.email}")
        print(f"   Role: {args.role}")
        print(f"   Organization: {args.organization or 'None'}")
    except sqlite3.IntegrityError:
        print(f"❌ User with email {args.email} already exists")
    finally:
        conn.close()

def list_users(args):
    """List all users"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, name, role, organization, last_active FROM users')
    users = cursor.fetchall()
    conn.close()
    
    if not users:
        print("📭 No users found")
        return
    
    print(f"\n📋 Users ({len(users)}):")
    print("-" * 80)
    for user in users:
        print(f"ID: {user[0]}")
        print(f"Email: {user[1]}")
        print(f"Name: {user[2]}")
        print(f"Role: {user[3]}")
        print(f"Organization: {user[4]}")
        print(f"Last Active: {user[5]}")
        print("-" * 40)

def create_organization(args):
    """Create a new organization"""
    print(f"🏢 Creating organization: {args.name}")
    
    org_id = str(uuid.uuid4())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO organizations (id, name, domain, logo, plan, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            org_id,
            args.name,
            args.domain,
            args.logo or "🏢",
            args.plan or "enterprise",
            "active"
        ))
        conn.commit()
        print(f"✅ Organization created successfully!")
        print(f"   ID: {org_id}")
        print(f"   Name: {args.name}")
        print(f"   Domain: {args.domain}")
    except sqlite3.IntegrityError:
        print(f"❌ Organization with domain {args.domain} already exists")
    finally:
        conn.close()

def list_organizations(args):
    """List all organizations"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name, domain, plan, status, created_at FROM organizations')
    orgs = cursor.fetchall()
    conn.close()
    
    if not orgs:
        print("📭 No organizations found")
        return
    
    print(f"\n📋 Organizations ({len(orgs)}):")
    print("-" * 80)
    for org in orgs:
        print(f"ID: {org[0]}")
        print(f"Name: {org[1]}")
        print(f"Domain: {org[2]}")
        print(f"Plan: {org[3]}")
        print(f"Status: {org[4]}")
        print(f"Created: {org[5]}")
        print("-" * 40)

def seed_demo_data(args):
    """Seed the database with demo data"""
    print("🌱 Seeding demo data...")
    
    # Create organizations
    orgs = [
        {"name": "Acme Corporation", "domain": "acme.com", "logo": "🏢", "plan": "enterprise"},
        {"name": "TechCorp Inc", "domain": "techcorp.com", "logo": "💻", "plan": "business"},
        {"name": "CloudScale", "domain": "cloudscale.io", "logo": "☁️", "plan": "enterprise"},
        {"name": "StartupX", "domain": "startupx.dev", "logo": "🚀", "plan": "startup"},
    ]
    
    org_ids = {}
    for org in orgs:
        org_id = str(uuid.uuid4())
        org_ids[org['domain']] = org_id
        create_org_sql(org_id, org)
        print(f"  ✅ Organization: {org['name']}")
    
    # Create users for each role
    demo_users = [
        {"email": "admin@logsentinel.ai", "password": "Admin@2024", "name": "Super Admin", "role": "super_admin", "org": None},
        {"email": "orgadmin@acme.com", "password": "OrgAdmin@2024", "name": "Org Admin", "role": "org_admin", "org": "acme.com"},
        {"email": "security@acme.com", "password": "Security@2024", "name": "Security Analyst", "role": "security_analyst", "org": "acme.com"},
        {"email": "devops@acme.com", "password": "DevOps@2024", "name": "DevOps Engineer", "role": "devops_engineer", "org": "acme.com"},
        {"email": "ai@logsentinel.ai", "password": "AI@2024", "name": "AI Analyst", "role": "ai_analyst", "org": None},
        {"email": "viewer@acme.com", "password": "Viewer@2024", "name": "Viewer", "role": "viewer", "org": "acme.com"},
    ]
    
    for user in demo_users:
        org_id = org_ids.get(user['org']) if user['org'] else None
        create_user_sql(user, org_id)
        print(f"  ✅ User: {user['email']} ({user['role']})")
    
    print("✅ Demo data seeded successfully!")

def create_org_sql(org_id, org_data):
    """Helper to create organization"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO organizations (id, name, domain, logo, plan, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (org_id, org_data['name'], org_data['domain'], org_data['logo'], org_data['plan'], "active"))
        conn.commit()
    finally:
        conn.close()

def create_user_sql(user_data, org_id):
    """Helper to create user"""
    password_hash = generate_password_hash(user_data['password'])
    user_id = str(uuid.uuid4())
    
    role_permissions = {
        'super_admin': ['manage_system', 'manage_organizations', 'view_all_logs', 'manage_users', 'configure_ai', 'billing_access', 'audit_logs'],
        'org_admin': ['manage_team', 'configure_log_sources', 'manage_api_keys', 'view_org_logs', 'configure_alerts', 'manage_budgets'],
        'security_analyst': ['view_security_logs', 'investigate_incidents', 'run_ai_queries', 'create_reports', 'configure_rules', 'threat_hunting'],
        'devops_engineer': ['view_system_logs', 'monitor_performance', 'configure_agents', 'manage_integrations', 'troubleshoot_issues', 'view_metrics'],
        'ai_analyst': ['train_models', 'analyze_patterns', 'create_insights', 'configure_anomaly_detection', 'view_ai_metrics', 'export_analysis'],
        'viewer': ['view_dashboards', 'read_logs', 'export_reports', 'view_analytics', 'no_write_access']
    }
    
    permissions = json.dumps(role_permissions.get(user_data['role'], role_permissions['viewer']))
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO users (id, email, password_hash, name, role, organization, permissions, last_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            user_data['email'],
            password_hash,
            user_data['name'],
            user_data['role'],
            org_id,
            permissions,
            datetime.now().isoformat()
        ))
        conn.commit()
    finally:
        conn.close()

def run_server(args):
    """Run the development server"""
    print("🚀 Starting development server...")
    print(f"   Host: {args.host}")
    print(f"   Port: {args.port}")
    print(f"   Debug: {args.debug}")
    print("-" * 50)
    
    # Try to import and run Flask app
    try:
        from app import app
        app.run(host=args.host, port=args.port, debug=args.debug)
    except ImportError:
        print("❌ Could not import Flask app. Make sure app.py exists.")
        print("   Creating a simple test server instead...")
        
        # Create a simple test server
        from flask import Flask, jsonify, request
        test_app = Flask(__name__)
        
        @test_app.route('/api/public/organizations')
        def get_organizations():
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, domain, logo FROM organizations')
            orgs = cursor.fetchall()
            conn.close()
            
            return jsonify({
                'organizations': [
                    {'id': o[0], 'name': o[1], 'domain': o[2], 'logo': o[3]}
                    for o in orgs
                ]
            })
        
        @test_app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
        def login():
            if request.method == 'OPTIONS':
                return '', 200
                
            data = request.json
            email = data.get('email')
            password = data.get('password')
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT id, email, name, role, organization FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return jsonify({
                    'success': True,
                    'token': 'test-token-' + uuid.uuid4().hex,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'name': user[2],
                        'role': user[3],
                        'organization': user[4]
                    }
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Invalid credentials'
                }), 401
        
        test_app.run(host=args.host, port=args.port, debug=args.debug)

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='LogSentinel AI Management Script')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Init DB command
    subparsers.add_parser('init', help='Initialize database')
    
    # Create user command
    user_parser = subparsers.add_parser('create-user', help='Create a new user')
    user_parser.add_argument('--email', required=True, help='User email')
    user_parser.add_argument('--password', required=True, help='User password')
    user_parser.add_argument('--name', help='User name')
    user_parser.add_argument('--role', default='viewer', choices=[
        'super_admin', 'org_admin', 'security_analyst', 
        'devops_engineer', 'ai_analyst', 'viewer'
    ], help='User role')
    user_parser.add_argument('--organization', help='Organization ID')
    
    # List users command
    subparsers.add_parser('list-users', help='List all users')
    
    # Create organization command
    org_parser = subparsers.add_parser('create-org', help='Create an organization')
    org_parser.add_argument('--name', required=True, help='Organization name')
    org_parser.add_argument('--domain', required=True, help='Organization domain')
    org_parser.add_argument('--logo', help='Organization logo')
    org_parser.add_argument('--plan', default='free', help='Subscription plan')
    
    # List organizations command
    subparsers.add_parser('list-orgs', help='List all organizations')
    
    # Seed demo data
    subparsers.add_parser('seed', help='Seed demo data')
    
    # Run server
    server_parser = subparsers.add_parser('runserver', help='Run development server')
    server_parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    server_parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    server_parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    if args.command == 'init':
        init_db()
    elif args.command == 'create-user':
        create_user(args)
    elif args.command == 'list-users':
        list_users(args)
    elif args.command == 'create-org':
        create_organization(args)
    elif args.command == 'list-orgs':
        list_organizations(args)
    elif args.command == 'seed':
        init_db()
        seed_demo_data(args)
    elif args.command == 'runserver':
        run_server(args)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()