# seed_rooms.py

from app import create_app, db
from app.models.room_model import Room
from datetime import date, timedelta
import random

app = create_app()

def generate_rooms():
    """Generate realistic hotel room data focusing on Paris"""
    rooms = [
        # 1. Le Meurice (Lüks)
        Room(
            hotel_name="Le Meurice",
            city="Paris",
            district="1st Arrondissement",
            rating=4.8,
            capacity=2,
            price=950.0,
            available_from=date(2025, 7, 1),
            available_to=date(2025, 12, 31),
            amenities="Free Wi-Fi, Breakfast, Pool, Spa, Gym, Restaurant, Bar"
        ),
        
        # 2. Hôtel Plaza Athénée (Iconik)
        Room(
            hotel_name="Hôtel Plaza Athénée",
            city="Paris",
            district="8th Arrondissement",
            rating=4.9,
            capacity=2,
            price=1200.0,
            available_from=date(2025, 7, 15),
            available_to=date(2025, 11, 30),
            amenities="Free Wi-Fi, Breakfast, Pool, Spa, Gym, Restaurant, Eiffel View"
        ),
        
        # 3. Le Bristol Paris (Oscar'lı)
        Room(
            hotel_name="Le Bristol Paris",
            city="Paris",
            district="8th Arrondissement",
            rating=4.9,
            capacity=2,
            price=1100.0,
            available_from=date(2025, 8, 1),
            available_to=date(2025, 12, 20),
            amenities="Free Wi-Fi, Breakfast, Pool, Spa, 3-Michelin Star Restaurant"
        ),
        
        # 4. Hôtel de Crillon (Tarihi)
        Room(
            hotel_name="Hôtel de Crillon",
            city="Paris",
            district="8th Arrondissement",
            rating=4.7,
            capacity=2,
            price=850.0,
            available_from=date(2025, 7, 10),
            available_to=date(2025, 11, 15),
            amenities="Free Wi-Fi, Breakfast, Spa, Gym, Historic Building"
        ),
        
        # 5. Mandarin Oriental Paris (Modern Lüks)
        Room(
            hotel_name="Mandarin Oriental Paris",
            city="Paris",
            district="1st Arrondissement",
            rating=4.8,
            capacity=2,
            price=980.0,
            available_from=date(2025, 8, 5),
            available_to=date(2025, 12, 10),
            amenities="Free Wi-Fi, Breakfast, Pool, Spa, 2-Michelin Star Restaurant"
        ),
        
        # 6. Hôtel Lutetia (Left Bank)
        Room(
            hotel_name="Hôtel Lutetia",
            city="Paris",
            district="6th Arrondissement",
            rating=4.6,
            capacity=2,
            price=720.0,
            available_from=date(2025, 7, 20),
            available_to=date(2025, 12, 15),
            amenities="Free Wi-Fi, Breakfast, Spa, Jazz Bar"
        ),
        
        # 7. Le Narcisse Blanc (Butik Otel)
        Room(
            hotel_name="Le Narcisse Blanc",
            city="Paris",
            district="7th Arrondissement",
            rating=4.5,
            capacity=2,
            price=650.0,
            available_from=date(2025, 9, 1),
            available_to=date(2025, 12, 31),
            amenities="Free Wi-Fi, Breakfast, Spa, Boutique Style"
        )
    ]
    
    # Add 3-5 room variations for each hotel with slight price differences
    additional_rooms = []
    for room in rooms:
        for i in range(random.randint(3, 5)):
            new_room = Room(
                hotel_name=room.hotel_name,
                city=room.city,
                district=room.district,
                rating=room.rating,
                capacity=room.capacity,
                price=room.price * (0.9 + random.random() * 0.2),  # +/- 10% price variation
                available_from=room.available_from + timedelta(days=random.randint(0, 7)),
                available_to=room.available_to - timedelta(days=random.randint(0, 7)),
                amenities=room.amenities
            )
            additional_rooms.append(new_room)
    
    return rooms + additional_rooms

with app.app_context():
    try:
        print("🧹 Deleting old room data...")
        db.session.query(Room).delete()
        db.session.commit()
        
        print("🏨 Generating Paris hotel room data...")
        rooms = generate_rooms()
        
        print(f"📝 Inserting {len(rooms)} rooms...")
        db.session.add_all(rooms)
        db.session.commit()
        
        print(f"✅ {len(rooms)} rooms inserted successfully.")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error occurred while inserting rooms: {e}")