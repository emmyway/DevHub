import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import HandleDelete from '../components/DeleteArticle';
import EditPost from './EditPost';
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
    <div className="card m-2 p-2">
      <h1>{article.title}</h1>
      <hr />
      {/* <p className='text-muted'>{article.description}</p> */}
      <div className="card-body">
        <p>{article.body}</p>
      </div>
      <hr />
      <div className="d-flex justify-content-between m-auto" >
        <Link to={`/edit-post/${id}`} className="btn btn-primary">Edit Post</Link>
        <HandleDelete id={id} />
      </div>
    </div>
  );
};

export default ArticleDetails;
