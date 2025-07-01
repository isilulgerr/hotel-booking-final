def check_hotel_capacities():
    # Burada DB sorgusu yapılır (örnek: Render PostgreSQL)
    print("🟡 [Scheduler] Checking hotel capacities... (simulate)")
    # DB'den kapasitesi düşük olanlar çekilir → admin'e bildirim gönderilir

def send_reservation_notification(data):
    print(f"🟢 [Queue] New reservation received for hotel {data['hotel_id']}")
    print(f"→ Notify admin: {data['full_name']} booked from {data['start_date']} to {data['end_date']}")
    # Gerçek sistemde: Email, SMS, Discord webhook vs. olabilir
