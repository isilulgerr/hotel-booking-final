# seed_rooms.py

from app import create_app, db
from app.models.room_model import Room
from datetime import date

app = create_app()

with app.app_context():
    try:
        print("🧹 Deleting old room data...")
        db.session.query(Room).delete()
        db.session.commit()
        room1 = Room(
        hotel_name="Hotel Roma Plaza",
        city="Rome",
        district="City Centre",
        rating=4.5,
        capacity=2,
        price=210.0,
        available_from=date(2025, 7, 10),
        available_to=date(2025, 7, 20),
        amenities="Free Wi-Fi, Breakfast, Pool"
        )

        room2 = Room(
        hotel_name="Grand Hotel",
        city="Rome",
        district="Monti",
        rating=4.3,
        capacity=2,
        price=250.0,
        available_from=date(2025, 7, 12),
        available_to=date(2025, 7, 25),
        amenities="Free Wi-Fi, Breakfast, Pool"
        )

        db.session.add_all([room1, room2])
        db.session.commit()
        print("✅ Sample rooms inserted successfully.")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error occurred while inserting rooms: {e}")
