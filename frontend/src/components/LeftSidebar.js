import React from 'react';
import { Col } from 'react-bootstrap';
import calmlyImage from '../images/rest.jpg';

const LeftSidebar = () => {
  return (
    <Col xs={12} md={3} className="bg-light">
      <h4>Growth</h4>
      {/* Add content here, e.g., tags, categories, etc. */}
      <ul>
        <li>
          <a href="#">Dev Community</a>
          <p>DEV Community is a community of 2,198,981 amazing developers
          We're a place where coders share, stay up-to-date and grow their careers.</p>
        </li>
        <li>
          <a href="#">#discussion</a>
          <p>Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). Where does it come from? Contrary to popular belief</p>
        </li>
        <img src={ calmlyImage } alt="ai img" className="container-fluid"/>
        <li><a href="#">#region</a></li>
      </ul>
    </Col>
  );
};

export default LeftSidebar;
