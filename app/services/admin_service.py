from app.models.room_model import Room
from app import db
from datetime import datetime

def add_room_to_db(data):
    room = Room(
        hotel_name=data.get("hotel_name"),
        city=data.get("city"),
        capacity=data.get("capacity"),
        price=data.get("price"),
        available_from=datetime.strptime(data.get("available_from"), "%Y-%m-%d").date(),
        available_to=datetime.strptime(data.get("available_to"), "%Y-%m-%d").date()
    )
    db.session.add(room)
    db.session.commit()
    return room

def update_room_in_db(room_id, data):
    room = Room.query.get(room_id)
    if not room:
        return None  # frontend'de "Room not found" gibi mesaj göstereceğiz

    # Güncellenebilir alanlar:
    room.hotel_name = data.get("hotel_name", room.hotel_name)
    room.city = data.get("city", room.city)
    room.capacity = data.get("capacity", room.capacity)
    room.price = data.get("price", room.price)

    if "available_from" in data:
        room.available_from = datetime.strptime(data["available_from"], "%Y-%m-%d").date()
    if "available_to" in data:
        room.available_to = datetime.strptime(data["available_to"], "%Y-%m-%d").date()

    db.session.commit()
    return room