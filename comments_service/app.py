from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Ortam değişkenlerini yükle (.env varsa)
load_dotenv()

# Flask app
app = Flask(__name__)
CORS(app)

# Firestore bağlantısı başlat
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")  # 🔐 Firebase admin key JSON dosyası
    firebase_admin.initialize_app(cred)

db = firestore.client()
comments_ref = db.collection("comments")

@app.route("/api/v1/comments/add", methods=["POST"])
def add_comment():
    data = request.get_json()
    comment_data = {
        "hotel_id": data.get("hotel_id"),
        "user_name": data.get("user_name"),
        "comment": data.get("comment"),
        "ratings": data.get("ratings")  # örn: {"service": 5, "cleanliness": 4}
    }
    comments_ref.add(comment_data)
    return jsonify({"message": "Comment added"}), 201

@app.route("/api/v1/comments/<hotel_id>", methods=["GET"])
def get_comments(hotel_id):
    query = comments_ref.where("hotel_id", "==", hotel_id).stream()
    comments = [doc.to_dict() for doc in query]
    return jsonify(comments)

@app.route("/api/v1/comments/summary/<hotel_id>", methods=["GET"])
def get_summary(hotel_id):
    query = comments_ref.where("hotel_id", "==", hotel_id).stream()
    summary = {}
    count = 0

    for doc in query:
        comment = doc.to_dict()
        ratings = comment.get("ratings", {})
        for category, score in ratings.items():
            if category not in summary:
                summary[category] = []
            summary[category].append(score)
        count += 1

    averages = {
        k: round(sum(v)/len(v), 2) for k, v in summary.items() if v
    }

    return jsonify({
        "averages": averages,
        "total_comments": count
    })

@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=True)
