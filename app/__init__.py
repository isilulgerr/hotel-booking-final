from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from flask_cors import CORS
load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

from app.models import Room  

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    jwt.init_app(app)

    # Blueprints
    from app.routes.admin_routes import admin_bp
    from app.routes.search_routes import search_bp
    from app.routes.book_routes import book_bp
    from app.routes.comments_routes import comments_bp
    from app.routes.notification_routes import notification_bp
    from app.routes.recommendation_routes import recommendation_bp
    from app.routes.hotel_routes import hotel_bp
    from app.routes.agent_routes import agent_bp
    from app.routes.gateway_routes import gateway_bp
    app.register_blueprint(gateway_bp)
    app.register_blueprint(agent_bp)
    app.register_blueprint(hotel_bp)
    app.register_blueprint(recommendation_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(book_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(search_bp)

    @app.route("/hello")
    def hello():
        return "Hello from Hotel Booking API!"
    CORS(app, resources={
        r"/hotel/*": {"origins": "http://localhost:3000"},
        r"/add-comment": {"origins": "*"}
    })
    return app
