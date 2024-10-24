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

    # Extract and normalize data
    username = data.get("username").lower()
    email = data.get("email").lower()
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")  

    # Validate required fields
    if not all([username, email, password, first_name,last_name]):
        return jsonify({"message": "Missing required fields"}), 400

    # Check for existing username or email (case-insensitive for username)
    if User.query.filter(func.lower(User.username) == username).first():
        return jsonify({"message": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    # Create and save new user
    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    new_user.set_password(password)  # Assuming this hashes the password correctly
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
    """Authenticate a user and return an access token."""
    data = request.get_json()
    username = data.get("username").lower()
    password = data.get("password")

    user = User.query.filter(func.lower(User.username) == username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify({"access_token": access_token}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


@app.route("/create_post", methods=["POST"])
@jwt_required()
def create_post():
    """Create a new post for the authenticated user."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get("title")
    body = data.get("body")
    tags = data.get("tags", [])

    if not title or not body:
        return jsonify({"message": "Title and body are required"}), 400

    new_post = Post(host_id=current_user_id, title=title, body=body)

    for tag_name in tags:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        new_post.tags.append(tag)

    db.session.add(new_post)
    db.session.commit()
    cache.clear()  # Clear all cache when a new post is created
    return jsonify({"message": "Post created successfully"}), 201

# Retrieve a single post by its ID


@app.route("/get_post/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    """Retrieves a single post with comments and metadata.

    Args:
        post_id (int): ID of the post to retrieve

    Returns:
        tuple: JSON response with post data and status code
            success: ({"id": int, "title": str, ...}, 200)
            error: ({"message": str}, 404)
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    post = Post.query.get(post_id)
    host = User.query.get(post.host_id)

    if not post:
        return jsonify({"message": "Post not found"}), 404

    comments = []
    for comment in post.comments:
        user = User.query.get(comment.user_id)
        comments.append({
            "id": comment.id,
            "content": comment.body,
            "created": comment.created.isoformat(),
            "author": {
                "id": user.id,
                "name": user.full_name,
                "avatar": user.profile_pic
            },
            "likes": len(comment.likes),
            # This line checks if the current user has liked the comment
            "isLiked": current_user in comment.likes
        })

    return jsonify({
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "created": post.created.isoformat(),
        "host_id": post.host_id,
        "host_username": host.username if host else None,
        "host_avatar": host.profile_pic if host else None,
        "likes": len(post.liked_by),
        "tags": [tag.name for tag in post.tags],
        "comments": comments
    })

# Retrieve all posts or with optional pagination


@app.route("/get_posts", methods=["GET"])
def get_posts():
    """Retrieves all posts with optional pagination and tag filtering.

    Args:
        page (int, optional): Page number. Defaults to 1.
        tag (str, optional): Tag to filter posts by.

    Returns:
        tuple: JSON response with posts data and metadata
            success: ({"posts": list, "total": int, "pages": int, "current_page": int}, 200)
    """
    page = request.args.get('page', 1, type=int)
    per_page = 10
    tag = request.args.get('tag')

    cache_key = f"posts_page_{page}_tag_{tag}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data)

    query = Post.query

    if tag and tag != 'All':
        query = query.filter(Post.tags.any(Tag.name == tag))

    posts = query.order_by(desc(Post.created)).paginate(
        page=page, per_page=per_page, error_out=False)

    posts_data = []
    for post in posts.items:
        host = User.query.get(post.host_id)
        posts_data.append({
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "created": post.created.isoformat(),
            "host_id": post.host_id,
            "host_username": host.username if host else None,
            "host_avatar": host.profile_pic if host else None,
            "likes": len(post.liked_by),
            "tags": [tag.name for tag in post.tags]
        })

    result = {
        "posts": posts_data,
        "total": posts.total,
        "pages": posts.pages,
        "current_page": page
    }

    cache.set(cache_key, result, timeout=60)  # Cache for 1 minute
    return jsonify(result)

# New edit_post endpoint


@app.route("/edit_post/<int:post_id>", methods=["PUT"])
@jwt_required()
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
    cache.clear()  # Clear all cache when a post is edited
    return jsonify({"message": "Post updated successfully", "post": {"id": post.id, "title": post.title, "body": post.body}})

# New delete_post endpoint


@app.route("/delete_post/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Delete the post from the database
    db.session.delete(post)
    db.session.commit()
    cache.clear()  # Clear all cache when a post is deleted
    return jsonify({"message": "Post deleted successfully"})


# New endpoint to get current user information
@app.route("/current_user", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "bio": user.bio,
        "profile_pic": user.profile_pic
    }), 200


# New endpoint to edit user profile
@app.route("/edit_profile", methods=["PUT"])
@jwt_required()
def edit_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.form

    # Update user information if provided
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'email' in data:
        # Check if email is already in use
        if User.query.filter(User.email == data['email'], User.id != current_user_id).first():
            return jsonify({"message": "Email already in use"}), 400
        user.email = data['email']
    if 'username' in data:
        # Convert username to lowercase
        new_username = data['username'].lower()
        # Check if username is already in use
        if User.query.filter(func.lower(User.username) == new_username, User.id != current_user_id).first():
            return jsonify({"message": "Username already in use"}), 400
        user.username = new_username
    if 'bio' in data:
        user.bio = data['bio']

    # Handle profile picture upload
    if 'profile_pic' in request.files:
        file = request.files['profile_pic']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_extension = os.path.splitext(filename)[1]
            new_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
            file.save(file_path)
            user.profile_pic = new_filename

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "bio": user.bio,
            "profile_pic": user.profile_pic
        }
    }), 200

# Helper function to check allowed file extensions


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Add this route to serve uploaded files


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # In a more complex implementation, you might want to do some cleanup here
    return jsonify({"message": "Successfully logged out"}), 200


@app.route("/search", methods=["GET"])
def search():
    """Searches posts and users based on query string.

    Args:
        q (str): Search query
        page (int, optional): Page number. Defaults to 1
        per_page (int, optional): Results per page. Defaults to 10

    Returns:
        tuple: JSON response with search results and metadata
            success: ({"results": dict, "total_posts": int, ...}, 200)
            error: ({"message": str}, 400)
    """
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    if not query:
        return jsonify({"message": "No search query provided"}), 400

    cache_key = f"search_{query}_page_{page}_per_page_{per_page}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return jsonify(cached_result)

    # Search in posts (title and body) and order by creation date descending
    posts = Post.query.filter(or_(
        Post.title.ilike(f'%{query}%'),
        # Post.body.ilike(f'%{query}%')
    )).order_by(desc(Post.created)).paginate(page=page, per_page=per_page, error_out=False)

    users = User.query.filter(or_(
        User.username.ilike(f'%{query}%'),
        User.first_name.ilike(f'%{query}%'),
        User.last_name.ilike(f'%{query}%')
    )).paginate(page=page, per_page=per_page, error_out=False)

    results = {
        "posts": [{
            "id": post.id,
            "title": post.title,
            "body": post.body[:200] + "..." if len(post.body) > 200 else post.body,
            "host_username": User.query.get(post.host_id).username,
            "created": post.created.isoformat()
        } for post in posts.items],
        "users": [{
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "profile_pic": user.profile_pic
        } for user in users.items]
    }

    result = {
        "results": results,
        "total_posts": posts.total,
        "total_users": users.total,
        "current_page": page,
        "posts_pages": posts.pages,
        "users_pages": users.pages
    }

    # Cache search results for 5 minutes
    cache.set(cache_key, result, timeout=300)
    return jsonify(result)


@app.route("/trending_stories", methods=["GET"])
def trending_stories():
    """Retrieves trending stories based on likes.

    Args:
        None

    Returns:
        tuple: JSON response with trending stories data
            success: (list of {"id": int, "title": str, "likes": int, "host_username": str}, 200)
    """
    cached_data = cache.get('trending_stories')
    if cached_data:
        return jsonify(cached_data)

    trending_posts = db.session.query(Post, func.count(Post.liked_by).label('likes_count'))\
        .join(Post.liked_by)\
        .group_by(Post.id)\
        .order_by(desc('likes_count'))\
        .limit(10)\
        .all()

    trending_data = []
    for post, likes_count in trending_posts:
        host = User.query.get(post.host_id)
        trending_data.append({
            "id": post.id,
            "title": post.title,
            "likes": likes_count,
            "host_username": host.username if host else None
        })

    cache.set('trending_stories', trending_data,
              timeout=300)  # Cache for 5 minutes
    return jsonify(trending_data)


@app.route("/get_tags", methods=["GET"])
def get_tags():
    """Retrieves all tags with their usage count.

    Args:
        None

    Returns:
        tuple: JSON response with tags data
            success: (list of {"name": str, "count": int}, 200)
    """
    cached_data = cache.get('all_tags')
    if cached_data:
        return jsonify(cached_data)

    tags = Tag.query.all()
    tag_data = []
    for tag in tags:
        tag_data.append({
            "name": tag.name,
            # This assumes you have a relationship set up between Tag and Post
            "count": len(tag.tags)
        })

    cache.set('all_tags', tag_data, timeout=3600)  # Cache for 1 hour
    return jsonify(tag_data)


@app.route("/bookmark_post/<int:post_id>", methods=["POST"])
@jwt_required()
def bookmark_post(post_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"message": "User or post not found"}), 404

    if post in user.bookmarked_posts:
        user.bookmarked_posts.remove(post)
        is_bookmarked = False
        message = "Post unbookmarked successfully"
    else:
        user.bookmarked_posts.append(post)
        is_bookmarked = True
        message = "Post bookmarked successfully"

    db.session.commit()

    return jsonify({
        "message": message,
        "isBookmarked": is_bookmarked,
        "bookmarks": post.bookmarks
    }), 200


@app.route("/is_bookmarked/<int:post_id>", methods=["GET"])
@jwt_required()
def is_bookmarked(post_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"message": "User or post not found"}), 404

    is_bookmarked = post in user.bookmarked_posts

    return jsonify({
        "isBookmarked": is_bookmarked
    }), 200


@app.route("/bookmarks", methods=["GET"])
@jwt_required()
def get_bookmarks():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    bookmarked_posts = []

    for post in user.bookmarked_posts:
        bookmarked_posts.append({
            "id": post.id,
            "title": post.title,
            "created": post.created.isoformat(),
            "host_username": post.host.username if post.host else None,
        })

    return jsonify(bookmarked_posts), 200


@app.route("/like_post/<int:post_id>", methods=["POST"])
@jwt_required()
def like_post(post_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"message": "User or post not found"}), 404

    if post in user.liked_posts:
        user.liked_posts.remove(post)
        is_liked = False
        message = "Post unliked successfully"
    else:
        user.liked_posts.append(post)
        is_liked = True
        message = "Post liked successfully"

    db.session.commit()

    return jsonify({
        "message": message,
        "isLiked": is_liked,
        "likes": post.likes
    }), 200


@app.route("/is_liked/<int:post_id>", methods=["GET"])
@jwt_required()
def is_liked(post_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    post = Post.query.get(post_id)

    if not user or not post:
        return jsonify({"message": "User or post not found"}), 404

    is_liked = post in user.liked_posts

    return jsonify({
        "isLiked": is_liked
    }), 200


@app.route("/add_comment/<int:post_id>", methods=["POST"])
@jwt_required()
def add_comment(post_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"message": "Comment content is required"}), 400

    new_comment = Comment(user_id=current_user_id,
                          post_id=post_id, body=content)
    db.session.add(new_comment)
    db.session.commit()
    # Invalidate the recent activities cache
    cache.delete('view//recent_activities')
    user = User.query.get(current_user_id)

    return jsonify({
        "id": new_comment.id,
        "content": new_comment.body,
        "created": new_comment.created.isoformat(),
        "author": {
            "id": user.id,
            "name": user.full_name,
            "avatar": user.profile_pic
        },
        "likes": 0
    }), 201


@app.route("/like_comment/<int:comment_id>", methods=["POST"])
@jwt_required()
def like_comment(comment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    comment = Comment.query.get(comment_id)

    if not user or not comment:
        return jsonify({"message": "User or comment not found"}), 404

    if user in comment.likes:
        comment.likes.remove(user)
        is_liked = False
        message = "Comment unliked successfully"
    else:
        comment.likes.append(user)
        is_liked = True
        message = "Comment liked successfully"

    db.session.commit()

    return jsonify({
        "message": message,
        "isLiked": is_liked,
        "likes": len(comment.likes)
    }), 200


@app.route("/is_comment_liked/<int:comment_id>", methods=["GET"])
@jwt_required()
def is_comment_liked(comment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    comment = Comment.query.get(comment_id)

    if not user or not comment:
        return jsonify({"message": "User or comment not found"}), 404

    is_liked = user in comment.likes

    return jsonify({
        "isLiked": is_liked
    }), 200


@app.route("/delete_comment/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"message": "Comment not found"}), 404

    if comment.user_id != current_user_id:
        return jsonify({"message": "Unauthorized to delete this comment"}), 403

    db.session.delete(comment)
    db.session.commit()
    # Invalidate the recent activities cache
    cache.delete('view//recent_activities')
    return jsonify({"message": "Comment deleted successfully"}), 200


@app.route("/recent_activities", methods=["GET"])
@jwt_required()
def get_recent_activities():
    """Retrieves recent activities (comments) on posts.

    Args:
        None

    Returns:
        tuple: JSON response with recent activities data
            success: (list of {"user": dict, "post": dict, "action": str, "timestamp": str}, 200)
    """
    cached_data = cache.get('recent_activities')
    if cached_data:
        return jsonify(cached_data), 200

    # Get the 10 most recent comments
    recent_activities = db.session.query(Comment, Post, User)\
        .join(Post, Comment.post_id == Post.id)\
        .join(User, Comment.user_id == User.id)\
        .order_by(desc(Comment.created))\
        .limit(10)\
        .all()

    activity_data = []
    for comment, post, commenter in recent_activities:
        activity_data.append({
            "user": {
                "id": commenter.id,
                "name": commenter.full_name,
                "avatar": commenter.profile_pic
            },
            "post": {
                "id": post.id,
                "title": post.title
            },
            "action": "commented on",
            "timestamp": comment.created.isoformat()
        })

    cache.set('recent_activities', activity_data,
              timeout=60)  # Cache for 1 minute
    return jsonify(activity_data), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
