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

def get_filtered_hotels(city, budget, check_in, check_out, preferences, min_rating=None):
    print(f"\n🔎 Searching hotels with:\n  city={city}, budget={budget}, check_in={check_in}, check_out={check_out}, prefs={preferences}, min_rating={min_rating}\n")

    rooms = Room.query.filter(
        Room.city.ilike(city),
        Room.price <= budget,
        Room.available_from <= check_in,
        Room.available_to >= check_out
    ).all()

    print(f"🛏️ Found {len(rooms)} rooms matching city/price/dates")

    results = []
    filtered_prefs = [p.lower() for p in preferences if "stars" not in p.lower()]

    for room in rooms:
        print(f"👉 Room: {room.hotel_name}, rating={room.rating}, amenities={room.amenities}")
        if min_rating is not None and room.rating < min_rating:
            print("❌ Skipping due to rating")
            continue

        room_amenities = [a.strip().lower() for a in room.amenities.split(",")] if isinstance(room.amenities, str) else []
        if all(any(pref in amenity for amenity in room_amenities) for pref in filtered_prefs):
            print("✅ Room matched preferences!")
            results.append({
                "hotel_name": room.hotel_name,
                "room_id": room.id,
                "price": room.price,
                "rating": room.rating,
                "district": room.district,
                "amenities": room_amenities,
                "available_from": str(room.available_from),
                "available_to": str(room.available_to),
            })
        else:
            print("❌ Skipping due to amenities mismatch")

    print(f"\n✅ Returning {len(results)} final recommendations\n")
    return results
