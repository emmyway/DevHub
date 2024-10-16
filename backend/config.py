from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "your-secret-key")  # Change this to a secure secret key
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600  # 1 hour

login_manager = LoginManager()
login_manager.init_app(app)

jwt = JWTManager(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
