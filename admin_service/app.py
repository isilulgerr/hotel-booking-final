from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

# ENV değişkenlerini yükle (.env varsa)
load_dotenv()

# Flask app
app = Flask(__name__)
CORS(app)

# Konfigürasyonlar
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# MODELLERİ YÜKLE
from models.room_model import Room  # sadece bu serviste gerekli modeller

# ROUTE'ları register et
from routes.admin_routes import admin_bp
app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")

# Sağlık kontrolü için endpoint
@app.route("/health")
def health():
    return {"status": "ok"}

# Uygulama çalıştırılacaksa (Render zaten gunicorn ile çalıştırır)
if __name__ == "__main__":
    app.run(debug=True)
