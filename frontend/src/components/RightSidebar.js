import React from 'react';
import { Col } from 'react-bootstrap';
import officeImage from '../images/office.jpg';
import noteImage from '../images/note.jpg';

const RightSidebar = () => {
  return (
    <Col xs={12} md={3} className="bg-light">
      <h4>Trending</h4>
      {/* Add content here, e.g., user info, trending articles, etc. */}
      <p>Portfolio</p>
      <ul>
        <li>
          <a href="#">Trending Article 1</a></li>
          <img src={officeImage} alt="office" className="container-fluid"/>
        <li>
          <a href="#">Trending Article 2</a></li>
          <img src={ noteImage } alt="ai img" className="container-fluid"/>
        <li><a href="#">Trending Article 3</a></li>
      </ul>
    </Col>
  );
};

export default RightSidebar;
