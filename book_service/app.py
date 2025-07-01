from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Ortam değişkenlerini yükle
load_dotenv()

# Flask uygulaması
app = Flask(__name__)
CORS(app)

# Konfigürasyon
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Uzantılar
db = SQLAlchemy(app)
jwt = JWTManager(app)

# MODELLER
from models.booking_model import Booking  # Bu serviste kullanılan modeller
from models.room_model import Room  # Eğer kullanıcı doğrulaması gerekiyorsa

# ROUTE'lar
from routes.book_routes import book_bp
app.register_blueprint(book_bp, url_prefix="/api/v1/book")

# Sağlık kontrolü
@app.route("/health")
def health():
    return {"status": "ok"}

# Lokal test için çalıştırıcı
if __name__ == "__main__":
    app.run(debug=True)
