from flask import Blueprint, jsonify, request
from services.hotel_service import get_hotel_details
from app import db
from models.room_model import Room
from datetime import datetime
hotel_bp = Blueprint("hotel", __name__)
from urllib.parse import unquote 

@hotel_bp.route("/hotel/<string:hotel_name>", methods=["GET"])
def hotel_details(hotel_name):
    decoded_name = unquote(hotel_name)
    result = get_hotel_details(decoded_name)

    if isinstance(result, tuple):
        return jsonify({"error": f"No rooms found for hotel: '{decoded_name}'"}), 404  # 👈 Mesajı güncelle
    
    return jsonify(result)

@hotel_bp.route("/hotels/add-room", methods=["POST"])
def add_room():
    try:
        data = request.get_json()

        room = Room(
            hotel_name=data["hotel_name"],
            city=data["city"],
            district=data.get("district"),  
            rating=data.get("rating"),      
            capacity=data["capacity"],
            price=data["price"],
            available_from=datetime.strptime(data["available_from"], "%Y-%m-%d"),
            available_to=datetime.strptime(data["available_to"], "%Y-%m-%d"),
            amenities=data.get("amenities") 
        )

        db.session.add(room)
        db.session.commit()

        return jsonify({
            "message": "Room added successfully",
            "room_id": room.id
        }), 201

    except Exception as e:
        print("🔥 Add Room Error:", str(e))
        return jsonify({ "error": str(e) }), 500
    

@hotel_bp.route("/hotels/search", methods=["GET"])
def search_rooms():
    city = request.args.get("city")
    check_in = request.args.get("check_in")
    check_out = request.args.get("check_out")
    people = request.args.get("people", type=int)

    if not city or not check_in or not check_out or not people:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        check_in_date = datetime.strptime(check_in, "%Y-%m-%d").date()
        check_out_date = datetime.strptime(check_out, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    rooms = Room.query.filter(
        Room.city.ilike(f"%{city}%"),
        Room.available_from <= check_in_date,
        Room.available_to >= check_out_date,
        Room.capacity >= people
    ).all()

    results = []
    for room in rooms:
        results.append({
            "room_id": room.id,
            "hotel_name": room.hotel_name,
            "city": room.city,
            "district": room.district,
            "rating": room.rating,
            "capacity": room.capacity,
            "price": room.price,
            "available_from": room.available_from.strftime("%Y-%m-%d"),
            "available_to": room.available_to.strftime("%Y-%m-%d"),
            "amenities": room.amenities
        })
    print(f"✅ Returning: {[r['hotel_name'] for r in results]}")

    return jsonify({"results": results})