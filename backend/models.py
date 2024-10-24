from config import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.sql import func

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    bio = db.Column(db.Text, nullable=True, default='')
    profile_pic = db.Column(db.String(255), nullable=True, default='default.png')

    hosted_posts = db.relationship('Post', backref='host')
    commented_posts = db.relationship('Post', secondary='post_commentors', backref='commentors')
    liked_posts = db.relationship('Post', secondary='post_likes', backref='liked_by')
    bookmarked_posts = db.relationship('Post', secondary='post_bookmarks', backref='bookmarked_by')
    comments = db.relationship('Comment', backref='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}" if self.last_name else self.first_name

    def __repr__(self):
        return f'<User {self.username}>'

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<Tag {self.name}>'

post_commentors = db.Table('post_commentors',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

post_likes = db.Table('post_likes',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

post_bookmarks = db.Table('post_bookmarks',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

post_tag = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=True)
    updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    created = db.Column(db.DateTime, default=func.now())

    tags = db.relationship("Tag", secondary=post_tag, backref='tags')
    comments = db.relationship('Comment', backref='post')

    @property
    def likes(self):
       return len(self.liked_by) 

    @property
    def bookmarks(self):
        return len(self.bookmarked_by)

    def __repr__(self):
        return f'<Post {self.name}>'

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=True)
    body = db.Column(db.Text, nullable=False)
    updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    created = db.Column(db.DateTime, default=func.now())

    likes = db.relationship('User', secondary='comment_likes', backref='liked_comments')

    def __repr__(self):
        return f'<Comment {self.body[:60]}>'

comment_likes = db.Table('comment_likes',
    db.Column('comment_id', db.Integer, db.ForeignKey('comment.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)