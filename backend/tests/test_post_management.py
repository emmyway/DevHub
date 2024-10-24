import unittest
import json
from config import app, db
from models import Post, User
from flask_jwt_extended import create_access_token


class PostManagementTestCase(unittest.TestCase):
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
        self.user = User(username=self.user_data['username'], email=self.user_data['email'])
        self.user.set_password(self.user_data['password'])
        db.session.add(self.user)
        db.session.commit()

        # Create an access token for the user
        self.access_token = create_access_token(identity=self.user.id)

    def tearDown(self):
        """Clean up after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def create_post(self):
        """Helper method to create a post."""
        response = self.app.post("/create_post", 
                                 headers={"Authorization": f"Bearer {self.access_token}"}, 
                                 data=json.dumps(self.post_data), 
                                 content_type="application/json")
        return json.loads(response.data.decode())["post"]["id"]

    def test_edit_post(self):
        """Test editing a post."""
        post_id = self.create_post()

        # Edit the post
        updated_data = {"title": "Updated Title", "body": "Updated body"}
        response = self.app.put(f"/edit_post/{post_id}", 
                                headers={"Authorization": f"Bearer {self.access_token}"}, 
                                data=json.dumps(updated_data), 
                                content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['post']['title'], "Updated Title")
        self.assertEqual(data['post']['body'], "Updated body")

        # Verify changes in the database
        post = Post.query.get(post_id)
        self.assertEqual(post.title, "Updated Title")
        self.assertEqual(post.body, "Updated body")

    def test_edit_nonexistent_post(self):
        """Test editing a non-existent post."""
        updated_data = {"title": "Updated Title"}
        response = self.app.put("/edit_post/9999", 
                                headers={"Authorization": f"Bearer {self.access_token}"}, 
                                data=json.dumps(updated_data), 
                                content_type="application/json")
        self.assertEqual(response.status_code, 404)

    def test_delete_post(self):
        """Test deleting a post."""
        post_id = self.create_post()

        # Delete the post
        response = self.app.delete(f"/delete_post/{post_id}", 
                                   headers={"Authorization": f"Bearer {self.access_token}"})
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 200)
        self.assertIn("Post deleted successfully", data['message'])

        # Verify the post was deleted from the database
        post = Post.query.get(post_id)
        self.assertIsNone(post)

    def test_delete_nonexistent_post(self):
        """Test deleting a non-existent post."""
        response = self.app.delete("/delete_post/9999", 
                                   headers={"Authorization": f"Bearer {self.access_token}"})
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()