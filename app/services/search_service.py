from app.models.room_model import Room
from app import db
from datetime import datetime

def search_rooms(city, check_in, check_out, people, is_logged_in):
    check_in_date = datetime.strptime(check_in, "%Y-%m-%d").date()
    check_out_date = datetime.strptime(check_out, "%Y-%m-%d").date()

    rooms = Room.query.filter(
        Room.city.ilike(city),
        Room.capacity >= people,
        Room.available_from <= check_in_date,
        Room.available_to >= check_out_date
    ).all()

    result = []
    for room in rooms:
        price = room.price * 0.85 if is_logged_in else room.price
        result.append({
            "id": room.id,
            "hotel_name": room.hotel_name,
            "city": room.city,
            "capacity": room.capacity,
            "price": round(price, 2),
            "available_from": room.available_from.isoformat(),
            "available_to": room.available_to.isoformat()
        })

    return result
