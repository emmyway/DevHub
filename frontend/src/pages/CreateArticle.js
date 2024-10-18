import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const CreateArticle = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(''); // Quill content state (HTML format)
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle the Quill editor's change event and keep content in HTML
  const handleContentChange = (value) => {
    setContent(value); // Quill content remains in HTML format
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract plain text from the content to store in the database
    const plainText = new DOMParser().parseFromString(content, 'text/html').body.innerText;

    // Validate form fields
    if (!title || !description || !plainText.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      // Send article data to backend API
      await axios.post('http://localhost:5000/blogs', {
        title,
        description,
        body: plainText, // Send plain text as the body
      });
      
      // Redirect to the article list page after successful creation
      navigate('/home');
    } catch (err) {
      console.error('Error creating article:', err);
      setError('Failed to create article');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create New Article</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="fw-3">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
          />
        </div>

        <div className="form-group">
          <label className="fw-5">Description</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter article description"
          />
        </div>

        <div className="form-group">
          <label className="fw-3">Content</label>
          <ReactQuill
            value={content} // Bind the content (HTML format)
            onChange={handleContentChange} // Handle content change
            placeholder="Write the article content here..."
            style={{ height: '200px', border: '1px solid #ccc', overflowY:'auto' }} // Inline styling for height and border
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">Create Article</button>
      </form>
    </div>
  );
};

export default CreateArticle;
