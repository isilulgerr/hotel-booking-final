# app/services/hotel_service.py

from app.extensions.redis_client import redis_client
from app.models.room_model import Room
from app import db
import json

def get_hotel_details(hotel_name):
    cache_key = f"hotel:{hotel_name.lower()}"

    # 1. Redis'te varsa getir
    cached = redis_client.get(cache_key)
    if cached:
        print("🔁 Cache hit!")
        return json.loads(cached)

    print("❌ Cache miss, pulling from DB...")
    rooms = Room.query.filter_by(hotel_name=hotel_name).all()
    if not rooms:
        return {"error": "Hotel not found"}, 404

    data = [{
        "room_id": room.id,
        "city": room.city,
        "capacity": room.capacity,
        "price": room.price,
        "available_from": str(room.available_from),
        "available_to": str(room.available_to)
    } for room in rooms]

    # Redis'e 1 saatlik TTL ile yaz
    redis_client.setex(cache_key, 3600, json.dumps(data))

    return data
