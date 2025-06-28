from datetime import datetime, timedelta
from app.models.room_model import Room
from app.models.booking_model import Booking
from app.services.notification_service import notify_admin, notify_user
from app.services.reservation_queue import pull_all_reservations
from app import db

def run_nightly_check():
    print("🌙 Nightly scheduled task started...")

    # 1. Check capacity
    one_month_later = datetime.now() + timedelta(days=30)
    all_rooms = Room.query.all()

    for room in all_rooms:
        bookings = Booking.query.filter(
            Booking.room_id == room.id,
            Booking.check_in_date <= one_month_later
        ).all()

        remaining_capacity = room.capacity - sum([b.people for b in bookings])
        if room.capacity > 0 and (remaining_capacity / room.capacity) < 0.2:
            notify_admin(room.id, room.hotel_name, remaining_capacity, room.capacity)

    # 2. Pull reservations from queue
    reservations = pull_all_reservations()
    for booking_data in reservations:
        notify_user(booking_data)

    print("✅ Nightly task finished.\n")
