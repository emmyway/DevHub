import unittest
import json
from config import app, db
from models import User
from werkzeug.security import generate_password_hash

class AuthTestCase(unittest.TestCase):
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
            "firstName": "Test",
            "lastName": "User"
        }

    def tearDown(self):
        """Clean up after each test."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_registration(self):
        """Test user registration."""
        response = self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 201)
        self.assertIn("User registered successfully", data['message'])

    def test_user_registration_existing_username(self):
        """Test registration with an existing username."""
        # Register a user
        self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")
        
        # Try to register the same user again
        response = self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 400)
        self.assertIn("Username already exists", data['message'])

    def test_user_login(self):
        """Test user login."""
        # First register the user
        self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")

        # Then attempt login
        login_data = {
            "username": self.user_data["username"],
            "password": self.user_data["password"]
        }
        response = self.app.post("/login", data=json.dumps(login_data), content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", data)

    def test_user_login_invalid_credentials(self):
        """Test user login with invalid credentials."""
        # Register a user
        self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")

        # Attempt login with wrong password
        login_data = {
            "username": self.user_data["username"],
            "password": "wrongpassword"
        }
        response = self.app.post("/login", data=json.dumps(login_data), content_type="application/json")
        data = json.loads(response.data.decode())
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid credentials", data['message'])

    def test_password_hashing(self):
        """Test that passwords are hashed before storing."""
        self.app.post("/register", data=json.dumps(self.user_data), content_type="application/json")
        user = User.query.filter_by(username=self.user_data['username']).first()
        self.assertNotEqual(user.password, self.user_data['password'])
        self.assertTrue(user.password.startswith('$2b$'))  # Check if it's a bcrypt hash

if __name__ == "__main__":
    unittest.main()