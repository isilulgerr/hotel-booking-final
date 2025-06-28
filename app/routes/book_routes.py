from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.book_service import book_room_logic

book_bp = Blueprint("book", __name__)

@book_bp.route("/book-room", methods=["POST"])
@jwt_required()
def book_room():
    data = request.get_json()

    room_id = data.get("room_id")
    people = data.get("people")
    check_in = data.get("check_in")
    check_out = data.get("check_out")

    if not all([room_id, people, check_in, check_out]):
        return jsonify({"msg": "Missing booking data"}), 400

    result = book_room_logic(room_id, people, check_in, check_out)

    if result.get("error"):
        return jsonify(result), 400

    return jsonify(result), 200
