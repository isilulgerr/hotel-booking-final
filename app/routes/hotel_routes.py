from flask import Blueprint, jsonify
from app.services.hotel_service import get_hotel_details

hotel_bp = Blueprint("hotel", __name__)

@hotel_bp.route("/hotel/<string:hotel_name>", methods=["GET"])
def hotel_details(hotel_name):
    result = get_hotel_details(hotel_name)
    return jsonify(result)
