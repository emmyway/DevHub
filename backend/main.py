"""
DevHub API Backend

This module contains the main Flask application for the DevHub API. It provides
endpoints for user authentication, post management, commenting, liking, bookmarking,
and various other features of the DevHub platform.

The API uses JWT for authentication and Redis for caching frequently accessed data.
It interacts with a database (assumed to be set up in config.py) to store and retrieve data.

Key features:
- User registration and authentication
- Post creation, retrieval, editing, and deletion
- Comment management
- Like and bookmark functionality
- Tag management
- Search functionality
- Trending stories
- Recent activities

Note: Ensure that all required dependencies are installed and the database is properly
configured before running this application.
"""

from flask import jsonify, request, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from config import db, app, login_manager
from models import Post, User, Tag, Comment
from werkzeug.utils import secure_filename
import os
from sqlalchemy import or_, desc, func
from flask_caching import Cache
import uuid


# Redis configuration for caching
cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    # Adjust this URL if Redis server is not local
    'CACHE_REDIS_URL': 'redis://localhost:6379/0',
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes default cache timeout
})


@login_manager.user_loader
def load_user(id):
    """Load user by ID for Flask-Login."""
    return User.query.get(int(id))


@app.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    # Convert username to lowercase for case-insensitive comparison
    username = data.get("username").lower()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")

    # Validate required fields
    if not all([username, email, password, first_name]):
        return jsonify({"message": "Missing required fields"}), 400

    # Check for existing username or email
    if User.query.filter(func.lower(User.username) == username).first():
        return jsonify({"message": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Create and save new user
    new_user = User(username=username, email=email,
                    first_name=first_name, last_name=last_name)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    # Generate access token
    access_token = create_access_token(identity=new_user.id)

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token
    }), 201


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

# Retrieve a single post by its ID
@app.route("/get_post/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"message": "Post not found"}), 404

    return jsonify({
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "created": post.created,
        "updated": post.updated,
        "host_id": post.host_id,
        "tags": [tag.name for tag in post.tags],
        "likes": post.likes,
        "bookmarks": post.bookmarks,
    })

# Retrieve all posts or with optional pagination
@app.route("/get_posts", methods=["GET"])
def get_posts():
    page = request.args.get('page', 1, type=int)  # Optional pagination
    per_page = request.args.get('per_page', 10, type=int)  # Items per page

    posts = Post.query.paginate(page=page, per_page=per_page, error_out=False)

    data = []
    for post in posts.items:
        data.append({
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "created": post.created,
            "updated": post.updated,
            "host_id": post.host_id,
            "tags": [tag.name for tag in post.tags],
            "likes": post.likes,
            "bookmarks": post.bookmarks,
        })

    return jsonify({
        "total": posts.total,
        "pages": posts.pages,
        "current_page": posts.page,
        "next_page": posts.next_num,
        "previous_page": posts.prev_num,
        "posts": data
    })

# New edit_post endpoint
@app.route("/edit_post/<int:post_id>", methods=["PUT"])
def edit_post(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"message": "Post not found"}), 404

    title = request.json.get("title")
    body = request.json.get("body")

    if not title and not body:
        return jsonify({"message": "No updates provided"}), 400

    # Update post title and body if provided
    if title:
        post.title = title
    if body:
        post.body = body

    # Commit the changes to the database
    db.session.commit()

    return jsonify({"message": "Post updated successfully", "post": {"id": post.id, "title": post.title, "body": post.body}})

# New delete_post endpoint
@app.route("/delete_post/<int:post_id>", methods=["DELETE"])
def delete_post(post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Delete the post from the database
    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully"})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
