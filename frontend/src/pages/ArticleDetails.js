import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HandleDelete from '../components/DeleteArticle';
// import './ArticleDetails.css'; // Optional: for custom styles

const ArticleDetails = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [article, setArticle] = useState(null); // State to store the article details
  const [loading, setLoading] = useState(true); // State to manage loading

  // Fetch the article details from the backend API
  useEffect(() => {
    //making a post request
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/blogs/${id}`);
        setArticle(response.data); // Update state with article details
        setLoading(false);
      } catch (error) {
        console.error('Error fetching the article:', error);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]); // Run effect when the article ID changes

  if (loading) {
    return <div>Loading article...</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <div className="article-details">
      <h1>{article.title}</h1>
      <p>{article.description}</p>
      <div className="article-body">
        <p>{article.body}</p>
      </div>
      <button onClick={HandleDelete} btn btn-primary>Delete</button>
    </div>
  );
};

export default ArticleDetails;
