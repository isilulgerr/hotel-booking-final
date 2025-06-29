# app/routes/gateway_routes.py

import requests
from flask import Blueprint, request, jsonify
from app.services.book_service import book_room_logic
from app.services.hotel_service import get_filtered_hotels

gateway_bp = Blueprint("gateway", __name__)

AI_AGENT_URL = "http://127.0.0.1:5000/ai/parse"  # Artık parse-only endpoint

@gateway_bp.route("/gateway/message", methods=["POST"])
def handle_message():
    data = request.get_json()
    user_msg = data.get("message", "")

    if not user_msg:
        return jsonify({"error": "Empty message"}), 400

    try:
        print("📨 Sending to AI Agent for parsing...")
        ai_response = requests.post(AI_AGENT_URL, json={"message": user_msg})
        parsed_data = ai_response.json()
        print("🤖 AI Response:", parsed_data)

        # ❌ Parse edemediyse
        if "intent" not in parsed_data:
            return jsonify({"error": "AI could not parse message"}), 400

        intent = parsed_data["intent"]

        # 🏨 SEARCH INTENT
        if intent == "search_hotel":
            hotels = get_filtered_hotels(
                city=parsed_data["city"],
                budget=parsed_data["budget"],
                check_in=parsed_data["check_in"],
                check_out=parsed_data["check_out"],
                preferences=parsed_data.get("preferences", []),
                min_rating=parsed_data.get("min_rating", 0)
            )

            return jsonify({
                "intent": "search_hotel",
                "parsed": parsed_data,
                "recommendations": hotels
            })

        # 📦 BOOK INTENT
        elif intent == "book_room":
            result = book_room_logic(
                room_id=parsed_data["room_id"],
                people=parsed_data["people"],
                check_in=parsed_data["check_in"],
                check_out=parsed_data["check_out"]
            )
            return jsonify({
                "intent": "book_room",
                "parsed": parsed_data,
                "result": result
            })

        # ❌ Bilinmeyen intent
        else:
            return jsonify({"error": f"Unknown intent: {intent}"}), 400

    except Exception as e:
        print("🔥 Gateway error:", str(e))
        return jsonify({"error": "Gateway internal error"}), 500
