from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🔗 Servis URL'leri (base root, path eklenecek)
SERVICE_MAP = {
    "admin": "https://admin-service-8014.onrender.com",
    "agent": "https://agent-service-v59b.onrender.com",
    "book": "https://book-service-9dtv.onrender.com",
    "comments": "https://comments-service-o4l5.onrender.com",
    "hotel": "https://hotel-service-zmjn.onrender.com",
    "notification": "https://notification-service-ig42.onrender.com",
    "recommendation": "http://localhost:5007",  # henüz dışarı açık değil
    "search": "https://search-service-tknt.onrender.com"
}

# 🛡️ Authorization varsa al
def forward_headers():
    token = request.headers.get("Authorization")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = token
    return headers

# 🔁 Ana Gateway Proxy
@app.route("/api/v1/<service>/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def proxy(service, path):
    if service not in SERVICE_MAP:
        return jsonify({"error": "Unknown service"}), 404

    # 🌐 Versiyon ve servis adı ile URL oluştur
    target_url = f"{SERVICE_MAP[service]}/api/v1/{service}/{path}"
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

        return (resp.text, resp.status_code, resp.headers.items())


    except Exception as e:
        print("❌ Proxy Error:", str(e))
        return jsonify({"error": "Gateway proxy failed"}), 500

# 🤖 AI mesaj analiz ve yönlendirme
@app.route("/gateway/message", methods=["POST"])
def handle_ai_message():
    try:
        user_msg = request.get_json().get("message", "")
        if not user_msg:
            return jsonify({"error": "Empty message"}), 400

        # Intent çıkarımı
        ai_resp = requests.post(f"{SERVICE_MAP['agent']}/api/v1/agent/ai/parse", json={"message": user_msg})

        parsed = ai_resp.json()

        if "intent" not in parsed:
            return jsonify({"error": "AI parse failed"}), 400

        intent = parsed["intent"]

        # 📍 Yönlendirme
        if intent == "search_hotel":
            search_resp = requests.get(f"{SERVICE_MAP['search']}/api/v1/search/search-hotels", params={
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
            booking_resp = requests.post(f"{SERVICE_MAP['book']}/api/v1/book/book-room", json={
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
