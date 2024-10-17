import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const HandleDelete = ({ id }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleDeleteClick = async () => {
    try {
      await axios.delete(`http://localhost:5000/blogs/${id}`);
      setShowModal(false); // Close modal after deletion
      navigate('/home'); // Navigate to home after deletion
    } catch (error) {
      console.error("Error deleting the item!", error);
    }
  };

  return (
    <>
      {/* Button to trigger modal */}
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        Delete Article
      </button>

      {/* Modal structure */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this article?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteClick}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HandleDelete;
