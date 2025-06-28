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
