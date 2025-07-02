def check_hotel_capacities():
    print("🟡 [Scheduler] Checking hotel capacities... (simulate)")

def send_reservation_notification(data):
    print(f"🟢 [Queue] New reservation received for hotel {data['hotel_id']}")
    print(f"→ Notify admin: {data['full_name']} booked from {data['start_date']} to {data['end_date']}")
