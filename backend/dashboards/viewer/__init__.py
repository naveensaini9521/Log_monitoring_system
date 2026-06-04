from flask import Blueprint

viewer_bp = Blueprint('viewer', __name__)

# Import all route modules
from . import stats, resources, alerts, services, quick_view, reports, analytics, anomalies, ai_recommendations