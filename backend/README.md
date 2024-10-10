# DevHub API Documentation

## Getting Started
> For a styled version visit `documentation/api-documentation.html`

To start the Flask server, follow these steps:

1. Open your terminal.
2. Navigate to the project directory:
    ```bash
    cd ~/path_to_the_repo/backend
    ```
3. Activate your virtual environment:
    ```bash
    source .venv/bin/activate
    ```
4. Run the Flask application:
    ```bash
    python main.py
    ```

The server will start, and you can access the API by default at `http://127.0.0.1:5000` (check the terminal for more).

## Available Endpoints

### 1. Create Post
- **Endpoint**: `/create_post`
- **Method**: `POST`
- **Request Body**: All three fields **(hostId, title, body)** are required.
    ```json
    {
      "hostId": 1,
      "title": "My First Post",
      "body": "This is the body of my first post."
    }
    ```
- **Response**:
    ```json
    {
      "message": "Post created successfully"
    }
    ```

### 2. Additional Endpoints
Further endpoints will be documented here as they are created. Please refer to the API code for more details on available methods.

## Notes
Please ensure that your environment is set up with all necessary dependencies. Use the following command to install any required packages:
```bash
pip install -r requirements.txt
