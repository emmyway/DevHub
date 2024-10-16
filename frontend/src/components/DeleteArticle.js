import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// making a delete
 const HandleDelete = async () => {
  const { id } = useParams();
  const navigate = useNavigate();
  try {
    // perform the delete
    await axios.delete(`http://localhost:5000/blogs/${id}`);
    //return home after a succesfull delete
    navigate('/home');
  }
  catch (error){
    console.error("There was an error deleting the item!, error");
  }
};

export default HandleDelete;
