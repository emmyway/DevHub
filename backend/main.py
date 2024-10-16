from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from config import db, app, login_manager
from models import Post, User


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")

    if not username or not email or not password or not first_name:
        return jsonify({"message": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


@app.route("/create_post", methods=["POST"])
@jwt_required()
def create_post():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    body = data.get("body")

    if not title or not body:
        return jsonify({"message": "Title and body are required"}), 400

    new_post = Post(host_id=current_user_id, title=title, body=body)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Post created successfully"}), 201


@app.route("/posts", methods=["GET"])
@jwt_required()
def get_posts():
    posts = Post.query.all()
    return jsonify([{
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "host_id": post.host_id,
        "created": post.created.isoformat(),
        "updated": post.updated.isoformat()
    } for post in posts]), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
