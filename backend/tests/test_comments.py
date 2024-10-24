import unittest
import json
from config import app, db
from models import Post, User, Comment
from flask_jwt_extended import create_access_token

class TestComments(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            user = User(username='testuser', email='test@example.com')
            user.set_password('testpassword')
            db.session.add(user)
            db.session.commit()
            self.user_id = user.id
            self.auth_header = {'Authorization': f'Bearer {create_access_token(identity=user.id)}'}
            
            # Create a test post
            post = Post(host_id=user.id, title='Test Post', body='This is a test post.')
            db.session.add(post)
            db.session.commit()
            self.post_id = post.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_add_comment(self):
        response = self.client.post(f'/add_comment/{self.post_id}', json={
            'content': 'This is a test comment.'
        }, headers=self.auth_header)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['content'], 'This is a test comment.')

    def test_like_comment(self):
        # First, add a comment and capture the response
        comment_response = self.client.post(f'/add_comment/{self.post_id}', json={
            'content': 'This is a test comment.'
        }, headers=self.auth_header)
        
        # Ensure the comment was created
        self.assertEqual(comment_response.status_code, 201)
        comment_data = json.loads(comment_response.data)
        comment_id = comment_data['id']  # Assuming the response contains the ID of the new comment

        # Then, like the comment using the dynamic ID
        response = self.client.post(f'/like_comment/{comment_id}', headers=self.auth_header)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['isLiked'])
        self.assertEqual(data['likes'], 1)

if __name__ == "__main__":
    unittest.main()
