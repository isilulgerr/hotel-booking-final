from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.search_service import search_rooms

search_bp = Blueprint("search", __name__)

@search_bp.route("/search-hotels", methods=["GET"])
@jwt_required(optional=True)
def search_hotels():
    is_logged_in = get_jwt_identity() is not None

    city = request.args.get("city")
    check_in = request.args.get("check_in")
    check_out = request.args.get("check_out")
    people = request.args.get("people", type=int)

    if not all([city, check_in, check_out, people]):
        return jsonify({"msg": "Missing query parameters"}), 400

    results = search_rooms(city, check_in, check_out, people, is_logged_in)
    return jsonify(results)
