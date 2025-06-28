from flask import Blueprint, request, jsonify

recommendation_bp = Blueprint("recommendation", __name__)

@recommendation_bp.route("/recommend-hotels", methods=["POST"])
def recommend_hotels():
    data = request.get_json()
    city = data.get("city")
    budget = data.get("budget")

    # Dummy AI logic (yerine gerçek model entegrasyonu yapılabilir)
    recommendations = [
        {
            "hotel_name": f"{city} Budget Inn",
            "price_per_night": budget - 20,
            "rating": 4.2
        },
        {
            "hotel_name": f"{city} Comfort Suites",
            "price_per_night": budget,
            "rating": 4.5
        },
        {
            "hotel_name": f"{city} Luxury Hotel",
            "price_per_night": budget + 30,
            "rating": 4.9
        },
    ]
    return jsonify({"recommendations": recommendations})
