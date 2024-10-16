import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const CreateArticle = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(''); // Quill editor state for plain text
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle the Quill editor's change event and get plain text
  const handleContentChange = (value, delta, source, editor) => {
    const plainText = editor.getText(); // Get plain text without HTML tags
    setContent(plainText); // Update the state with plain text
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!title || !description || !content.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      // Send article data to backend API
      await axios.post('http://localhost:5000/blogs', {
        title,
        description,
        body: content, // Send plain text as the body
      });
      
      // Redirect to the article list page after successful creation
      navigate('/');
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
          <label clasName="fw-5">Description</label>
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
            value={content} // Bind the plain text content
            onChange={handleContentChange} // Handle content change to extract plain text
            placeholder="Write the article content here..."
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">Create Article</button>
      </form>
    </div>
  );
};

export default CreateArticle;
