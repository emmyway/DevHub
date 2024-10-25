# Make sure you have the following installed on your system:

Node.js
Python
pip
Redis
#Setup Instructions
## Backend Setup
### Navigate to the Backend Directory


cd backend
#### Install Backend Dependencies

### Make a venv
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
#### Start Redis Server Redis is required for background tasks or caching. Start Redis with:

redis-server
#### Activate the Virtual Environment

### Run the Flask Application

python main.py
### The backend API should now be running at:

http://127.0.0.1:5000
Frontend Setup
### Navigate to the Frontend Directory

cd ../frontend
### Install Frontend Dependencies
# DevHub Setup Guide

## Prerequisites
- Node.js
- Python 3.x
- pip
- Redis

## Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Redis server
redis-server

# Run Flask application
python main.py
Backend will run at: http://127.0.0.1:5000
Frontend Setup
bashCopy# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
Frontend will run at: http://localhost:3000
npm install

### Start the Frontend Application

npm run dev