from flask import Blueprint, request, jsonify
from app.services.ai_agent import parse_intent_message

agent_bp = Blueprint("agent", __name__)

@agent_bp.route("/ai/parse", methods=["POST"])
def ai_parse():
    data = request.get_json()
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "Missing message"}), 400

    try:
        result = parse_intent_message(message)
        return jsonify(result), 200
    except Exception as e:
        print("🔥 Agent error:", str(e))
        return jsonify({"error": "AI agent internal error"}), 500