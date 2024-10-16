from config import db, app
from flask import jsonify, request
from models import Post


@app.route("/create_post", methods=["POST"])
def create_post():
    host_id = request.json.get("hostId")
    title = request.json.get("title")
    body = request.json.get("body")

    if not host_id and not title and not body:
        return jsonify({"message": "Some is missing in hostId, title ,body"}), 400

    new_post = Post(host_id=host_id, title=title, body=body)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Post created successfully"})

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
