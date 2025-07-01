import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask
from flask_jwt_extended import JWTManager
from app.routes.search_routes import search_bp
from app import db
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

jwt = JWTManager(app)

app.register_blueprint(search_bp)

if __name__ == "__main__":
    app.run(port=5008, debug=True)
