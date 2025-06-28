from flask import Blueprint, request, jsonify
from app.services.notification_service import notify_user

notification_bp = Blueprint("notifications", __name__)

@notification_bp.route("/notify-user", methods=["POST"])
def notify():
    data = request.get_json()
    result = notify_user(data)
    return jsonify(result)
