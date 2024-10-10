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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
