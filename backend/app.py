from flask import Flask, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

from config import Config
from db import init_db, get_db
from auth.login import login_bp, login_required
from auth.register import register_bp
from websocket import register_socketio_events

# Import background processor
from processors.anomaly_detector import check_resources

# Blueprints (keep your existing imports)
from dashboards.super_admin import super_admin_bp
from dashboards.org_admin.members import org_members_bp
from dashboards.org_admin.log_sources import log_sources_bp
from dashboards.org_admin.invites import invites_bp
from dashboards.security_analyst.threats import threats_bp
from dashboards.security_analyst.incidents import incidents_bp
from dashboards.security_analyst.threat_intel import threat_intel_bp
from dashboards.security_analyst.threat_hunt import threat_hunt_bp
from dashboards.devops.clusters import clusters_bp
from dashboards.devops.metrics import metrics_bp
from dashboards.devops.deployments import deployments_bp
from dashboards.devops.log_stream import log_stream_bp
from dashboards.ai_analyst.models import ai_models_analyst_bp
from dashboards.ai_analyst.training import training_bp
from dashboards.viewer import viewer_bp

app = Flask(__name__)
app.config.from_object(Config)

init_db()

CORS(app,
     origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

socketio = SocketIO(app, cors_allowed_origins="*")
register_socketio_events(socketio)

# ========== BACKGROUND SCHEDULER (runs anomaly detector every 5 min) ==========
scheduler = BackgroundScheduler()
# Run check_resources every 5 minutes
scheduler.add_job(func=check_resources, trigger="interval", minutes=5, id="anomaly_detector")
scheduler.start()
# Shut down the scheduler when the app exits
atexit.register(lambda: scheduler.shutdown())

# Register blueprints (same as you had)
app.register_blueprint(login_bp, url_prefix='/api/auth')
app.register_blueprint(register_bp, url_prefix='/api/auth')
app.register_blueprint(super_admin_bp, url_prefix='/api/dashboard/super-admin')
app.register_blueprint(org_members_bp, url_prefix='/api/org')
app.register_blueprint(log_sources_bp, url_prefix='/api/org')
app.register_blueprint(invites_bp, url_prefix='/api/org')
app.register_blueprint(threats_bp, url_prefix='/api/security')
app.register_blueprint(incidents_bp, url_prefix='/api/security')
app.register_blueprint(threat_intel_bp, url_prefix='/api/security')
app.register_blueprint(threat_hunt_bp, url_prefix='/api/security')
app.register_blueprint(clusters_bp, url_prefix='/api/devops')
app.register_blueprint(metrics_bp, url_prefix='/api/devops')
app.register_blueprint(deployments_bp, url_prefix='/api/devops')
app.register_blueprint(log_stream_bp, url_prefix='/api/devops')
app.register_blueprint(ai_models_analyst_bp, url_prefix='/api/ai')
app.register_blueprint(training_bp, url_prefix='/api/ai')
app.register_blueprint(viewer_bp, url_prefix='/api/dashboard/viewer')

# Public routes
@app.route("/api/public/organizations", methods=["GET"])
def get_organizations():
    db = get_db()
    orgs = list(db.organizations.find({}, {"_id": 0}))
    return jsonify({"success": True, "organizations": orgs})

@app.route("/api/organizations", methods=["GET"])
@login_required
def get_user_organizations():
    db = get_db()
    role = session.get('role')
    if role == "super_admin":
        orgs = list(db.organizations.find({}, {"_id": 0}))
    else:
        org_id = session.get('organization_id')
        if org_id:
            from bson import ObjectId
            org = db.organizations.find_one({"_id": ObjectId(org_id)}, {"_id": 0})
            orgs = [org] if org else []
        else:
            orgs = []
    return jsonify({"success": True, "organizations": orgs})

@app.route("/")
def home():
    return jsonify({"message": "LogSentinel AI Backend Running 🚀"})

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8001, allow_unsafe_werkzeug=True)