from app import db
from app.models.room_model import Room
from datetime import datetime

def book_room_logic(room_id, people, check_in, check_out):
    try:
        people = int(people)
        check_in_date = datetime.strptime(check_in, "%Y-%m-%d").date()
        check_out_date = datetime.strptime(check_out, "%Y-%m-%d").date()

        room = Room.query.get(room_id)

        if not room:
            return {"error": "Room not found"}

        if room.capacity < people:
            return {"error": "Not enough capacity"}

        if not (room.available_from <= check_in_date <= room.available_to and
                room.available_from <= check_out_date <= room.available_to):
            return {"error": "Room not available in selected dates"}

        room.capacity -= people

        # Assuming you have a Booking model, create and save a new booking
        from app.models.booking_model import Booking  # Adjust import if needed
        new_booking = Booking()
        new_booking.check_in_date = check_in_date
        new_booking.check_out_date = check_out_date
        new_booking.people = people
        new_booking.room_id = room_id

        db.session.add(new_booking)
        db.session.commit()

        return {
            "booking_id": new_booking.id,
            "room_id": room_id,
            "check_in": check_in,
            "check_out": check_out
        }


    except Exception as e:
        return {"error": str(e)}