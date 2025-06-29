# app/services/notification_service.py

from datetime import datetime

def notify_user(booking_data):
    """
    Kullanıcıya rezervasyon bildirimi gönder (simülasyon).
    """
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
        f"📅 Stay: {check_in} ➡ {check_out}\n"
        f"{'-'*45}"
    )

    print(message)

    return {
        "msg": "Notification sent (simulated)",
        "status": "ok",
        "user": username,
        "hotel": hotel_name
    }


def notify_admin(room_id, hotel_name, remaining, total):
    """
    Hotel yöneticisine kapasite uyarısı gönder (simülasyon).
    """
    percent = (remaining / total) * 100 if total > 0 else 0
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    alert = (
        f"\n🚨 [ADMIN ALERT - {timestamp}]\n"
        f"🏨 Hotel: {hotel_name}\n"
        f"🛏️ Room ID: {room_id}\n"
        f"⚠️ Capacity Low: {remaining}/{total} ({percent:.1f}%)\n"
        f"{'!'*45}"
    )

    print(alert)
