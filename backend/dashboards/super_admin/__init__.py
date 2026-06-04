from flask import Blueprint

super_admin_bp = Blueprint('super_admin', __name__)

from . import system_health
from . import organizations
from . import global_analytics
from . import ai_models