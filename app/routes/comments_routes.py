from flask import Blueprint, request, jsonify
from app.services.comments_service import add_comment, get_comments_with_averages

comments_bp = Blueprint("comments", __name__)

@comments_bp.route("/add-comment", methods=["POST"])
def comment():
    data = request.get_json()
    return jsonify(add_comment(data))

@comments_bp.route("/room-comments/<room_id>", methods=["GET"])
def room_comments(room_id):
    return jsonify(get_comments_with_averages(room_id))
