from app import create_app, db
from app.services.reservation_queue import add_to_reservation_queue
from app.tasks.nightly_check import run_nightly_check

# Flask context başlat
app = create_app()
with app.app_context():
    # Kuyruğa sahte rezervasyon ekle
    add_to_reservation_queue({
        "username": "isil",
        "hotel_name": "Sunshine Hotel",
        "check_in_date": "2025-07-15",
        "check_out_date": "2025-07-18"
    })

    # Gece görevini çalıştır
    run_nightly_check()
