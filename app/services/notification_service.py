# app/services/notification_service.py

from datetime import datetime

def notify_user(booking_data):
    username = booking_data.get("username", "Unknown User")
    hotel_name = booking_data.get("hotel_name", "Unknown Hotel")
    check_in = booking_data.get("check_in_date", "N/A")
    check_out = booking_data.get("check_out_date", "N/A")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    message = (
        f"\n📩 [NOTIFICATION - {timestamp}]\n"
        f"✅ Booking Confirmed\n"
        f"👤 User: {username}\n"
        f"🏨 Hotel: {hotel_name}\n"
        f"📅 Stay: {check_in} to {check_out}\n"
        f"{'-'*40}"
    )

    # Simulated notification (log only)
    print(message)

    return {"msg": "Notification sent (simulated)", "status": "ok"}

def notify_admin(room_id, hotel_name, remaining, total):
    percent = (remaining / total) * 100
    print(
        f"\n🚨 ADMIN ALERT\n"
        f"Hotel: {hotel_name}, Room ID: {room_id}\n"
        f"Low Capacity: {remaining}/{total} ({percent:.1f}%)\n"
        f"Please take action!\n"
    )
