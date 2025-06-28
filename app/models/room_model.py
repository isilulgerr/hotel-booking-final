from app import db

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hotel_name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    available_from = db.Column(db.Date, nullable=False)
    available_to = db.Column(db.Date, nullable=False)
