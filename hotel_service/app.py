from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv

# .env dosyasından ortam değişkenlerini yükle
load_dotenv()

app = Flask(__name__)
CORS(app)

# Veritabanı ve konfigürasyon
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # %15 indirim için auth bakılabilir

# DB nesnesi
db = SQLAlchemy(app)

# MODELLER
from models.room_model import Room  # sadece Room yeterli
# Eğer User modeli varsa giriş kontrolü için onu da import edebilirsin

# ROUTES
from routes.hotel_routes import hotel_bp
app.register_blueprint(hotel_bp, url_prefix="/api/v1/hotel")

@app.route("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=True)
