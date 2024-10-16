import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ArticleDetails.css'; // Optional: for custom styles

const ArticleDetails = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [article, setArticle] = useState(null); // State to store the article details
  const [loading, setLoading] = useState(true); // State to manage loading

  // Fetch the article details from the backend API
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/articles/${id}`);
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

  return
}
