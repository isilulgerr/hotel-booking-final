# test_nightly.py

from app import create_app
from app.tasks.nightly_check import run_nightly_check,process_reservation_queue

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        run_nightly_check()
        process_reservation_queue()
