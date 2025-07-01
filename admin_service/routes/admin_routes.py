from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from admin_service.services.admin_service import add_room_to_db, update_room_in_db

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


@admin_bp.route("/admin/update-room/<int:room_id>", methods=["PUT"])
@jwt_required()
def update_room(room_id):
    data = request.get_json()
    updated_room = update_room_in_db(room_id, data)

    if not updated_room:
        return jsonify(msg="Room not found"), 404

    return jsonify(
        msg="Room updated successfully",
        room={
            "id": updated_room.id,
            "hotel_name": updated_room.hotel_name,
            "city": updated_room.city,
            "price": updated_room.price,
            "capacity": updated_room.capacity,
            "available_from": str(updated_room.available_from),
            "available_to": str(updated_room.available_to)
        }
    ), 200