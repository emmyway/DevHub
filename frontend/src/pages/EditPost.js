import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { useNavigate, useParams } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';

const EditPost = () => {
  const { id } = useParams(); // Get post ID from URL
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(''); // Quill content (HTML format)
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the existing post data
    axios.get(`http://localhost:5000/blogs/${id}`)
      .then(response => {
        const { title, description, body } = response.data;
        setTitle(title);
        setDescription(description);
        setContent(body); // Set the content as HTML for Quill
      })
      .catch(err => {
        console.error('Error fetching post data:', err);
        setError('Failed to load post data');
      });
  }, [id]);

  // Handle Quill editor content change
  const handleContentChange = (value) => {
    setContent(value); // Keep HTML format
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract plain text from the content
    const plainText = new DOMParser().parseFromString(content, 'text/html').body.innerText;

    // Validate form fields
    if (!title || !description || !plainText.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      // Send updated article data to backend API
      await axios.put(`http://localhost:5000/blogs/${id}`, {
        title,
        description,
        body: plainText, // Send plain text as the body
      });

      // Redirect to the article list page after successful update
      navigate('/home');
    } catch (err) {
      console.error('Error updating article:', err);
      setError('Failed to update article');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Edit Article</h2>

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
            placeholder="Edit the article content here..."
            style={{ height: '200px', border: '1px solid #ccc', overflowY:'auto' }} // Inline styling
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">Update Article</button>
      </form>
    </div>
  );
};

export default EditPost;
