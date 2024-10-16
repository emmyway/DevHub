import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import './ArticleList.css'; // Optional: For custom styles

const ArticleList = () => {
  const [articles, setArticles] = useState([]); // State to store articles
  const [loading, setLoading] = useState(true); // State to handle loading

  // Fetch articles from the backend API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/blogs');
        setArticles(response.data); // Update state with fetched articles
        setLoading(false);
      } catch (error) {
        console.error('Error fetching the articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []); // Empty dependency array means it runs once after initial render

  if (loading) {
    return <div>Loading articles...</div>;
  }

  return (
    <div className="card container-md py-2">
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        articles.map(article => (
          <div key={article.id} className="card mb-3">
            <div className='card-body'>
              <h5 className="card-title">{article.title}</h5>
              <p className="card-text">{article.description}</p>
              <Link to={`/articles/${article.id}`} className="btn btn-primary">Read more</Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ArticleList;
