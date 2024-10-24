import unittest
import json
from config import app, db
from models import Post, User
from flask_jwt_extended import create_access_token


class PostTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test variables and initialize app."""
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        self.post_data = {
            "title": "Test Post",
            "body": "This is a test post body."
        }

        # Create a user directly in the database
        user = User(username=self.user_data['username'], email=self.user_data['email'])
        user.set_password(self.user_data['password'])
        db.session.add(user)
        db.session.commit()

        # Create an access token for the user
        self.access_token = create_access_token(identity=user.id)

    def tearDown(self):
        """Clean up after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_create_post(self):
        """Test creating a post."""
        response = self.app.post("/create_post", 
                                 headers={"Authorization": f"Bearer {self.access_token}"}, 
                                 data=json.dumps(self.post_data), 
                                 content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 201)
        self.assertIn("Post created successfully", data['message'])

        # Verify the post was created in the database
        post = Post.query.filter_by(title=self.post_data['title']).first()
        self.assertIsNotNone(post)
        self.assertEqual(post.body, self.post_data['body'])

    def test_create_post_without_auth(self):
        """Test creating a post without authentication."""
        response = self.app.post("/create_post", 
                                 data=json.dumps(self.post_data), 
                                 content_type="application/json")
        self.assertEqual(response.status_code, 401)

    def test_get_posts(self):
        """Test retrieving posts."""
        # Create a post
        self.app.post("/create_post", 
                      headers={"Authorization": f"Bearer {self.access_token}"}, 
                      data=json.dumps(self.post_data), 
                      content_type="application/json")

        # Retrieve posts
        response = self.app.get("/get_posts", headers={"Authorization": f"Bearer {self.access_token}"})
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(data["posts"]) > 0)
        self.assertEqual(data["posts"][0]["title"], self.post_data["title"])

    def test_get_posts_without_auth(self):
        """Test retrieving posts without authentication."""
        response = self.app.get("/get_posts")
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()