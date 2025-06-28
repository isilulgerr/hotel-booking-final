from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from app.services.admin_service import add_room_to_db

admin_bp = Blueprint("admin", __name__)

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "1234"

@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify(msg="Invalid credentials"), 401

@admin_bp.route("/admin/add-room", methods=["POST"])
@jwt_required()
def add_room():
    data = request.get_json()
    room = add_room_to_db(data)
    return jsonify(
        msg="Room added successfully",
        room={
            "id": room.id,
            "hotel_name": room.hotel_name,
            "city": room.city,
            "price": room.price
        }
    ), 201
