# gateway/gateway.py
from flask import Flask, request, jsonify
import requests

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 👈 Bu satırı mutlaka ekle


# Servis URL'leri (LOCAL için ayarlıdır, production'da değiştirebilirsin)
SERVICE_MAP = {
    "admin": "https://admin-service-8014.onrender.com/api/v1/admin",
    "agent": "https://agent-service-v59b.onrender.com",
    "booking": "https://book-service-9dtv.onrender.com",
    "comments": "https://comments-service-o4l5.onrender.com",
    "hotel": "https://hotel-service-zmjn.onrender.com",
    "notification": "https://notification-service-ig42.onrender.com",
    "recommendation": "http://localhost:5007",
    "search": "https://search-service-tknt.onrender.com"
}

# JWT token'ı varsa al
def forward_headers():
    token = request.headers.get("Authorization")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = token
    return headers

@app.route("/<service>/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def proxy(service, path):
    if service not in SERVICE_MAP:
        return jsonify({"error": "Unknown service"}), 404

    target_url = f"{SERVICE_MAP[service]}/{path}"
    method = request.method
    headers = forward_headers()

    try:
        if method == "GET":
            resp = requests.get(target_url, params=request.args, headers=headers)
        elif method == "POST":
            resp = requests.post(target_url, json=request.get_json(), headers=headers)
        elif method == "PUT":
            resp = requests.put(target_url, json=request.get_json(), headers=headers)
        elif method == "DELETE":
            resp = requests.delete(target_url, headers=headers)
        else:
            return jsonify({"error": "Unsupported method"}), 405

        return (resp.content, resp.status_code, resp.headers.items())


    except Exception as e:
        print("❌ Proxy Error:", str(e))
        return jsonify({"error": "Gateway proxy failed"}), 500

# AI özel mesaj yönlendirme 
@app.route("/gateway/message", methods=["POST"])
def handle_ai_message():
    try:
        user_msg = request.get_json().get("message", "")
        if not user_msg:
            return jsonify({"error": "Empty message"}), 400

        ai_resp = requests.post(f"{SERVICE_MAP['agent']}/ai/parse", json={"message": user_msg})
        parsed = ai_resp.json()

        if "intent" not in parsed:
            return jsonify({"error": "AI parse failed"}), 400

        intent = parsed["intent"]

        if intent == "search_hotel":
            search_resp = requests.get(f"{SERVICE_MAP['search']}/search-hotels", params={
                "city": parsed["city"],
                "check_in": parsed["check_in"],
                "check_out": parsed["check_out"],
                "people": 2
            })
            return jsonify({
                "intent": intent,
                "parsed": parsed,
                "recommendations": search_resp.json()
            })

        elif intent == "book_room":
            booking_resp = requests.post(f"{SERVICE_MAP['booking']}/book-room", json={
                "room_id": parsed["room_id"],
                "people": parsed["people"],
                "check_in": parsed["check_in"],
                "check_out": parsed["check_out"]
            })
            return jsonify({
                "intent": intent,
                "parsed": parsed,
                "result": booking_resp.json()
            })

        else:
            return jsonify({"error": f"Unknown intent: {intent}"}), 400

    except Exception as e:
        print("🔥 AI Gateway Error:", str(e))
        return jsonify({"error": "Internal gateway error"}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)
