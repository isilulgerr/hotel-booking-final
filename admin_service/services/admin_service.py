from models.room_model import Room
from app import db
from datetime import datetime

from flask import Flask
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"  
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

jwt = JWTManager(app)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=5001, debug=True)


app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


def add_room_to_db(data):
    room = Room(
        hotel_name=data.get("hotel_name"),
        city=data.get("city"),
        capacity=data.get("capacity"),
        price=data.get("price"),
        available_from=datetime.strptime(data.get("available_from"), "%Y-%m-%d").date(),
        available_to=datetime.strptime(data.get("available_to"), "%Y-%m-%d").date()
    )
    db.session.add(room)
    db.session.commit()
    return room

def update_room_in_db(room_id, data):
    room = Room.query.get(room_id)
    if not room:
        return None  

    room.hotel_name = data.get("hotel_name", room.hotel_name)
    room.city = data.get("city", room.city)
    room.capacity = data.get("capacity", room.capacity)
    room.price = data.get("price", room.price)

    if "available_from" in data:
        room.available_from = datetime.strptime(data["available_from"], "%Y-%m-%d").date()
    if "available_to" in data:
        room.available_to = datetime.strptime(data["available_to"], "%Y-%m-%d").date()

    db.session.commit()
    return room