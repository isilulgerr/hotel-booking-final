# app/services/reservation_queue.py

reservation_queue = []

def add_to_reservation_queue(booking_data):
    reservation_queue.append(booking_data)

def pull_all_reservations():
    global reservation_queue
    pulled = reservation_queue[:]
    reservation_queue = []
    return pulled
