import React from 'react';
import { Col } from 'react-bootstrap';

const RightSidebar = () => {
  return (
    <Col xs={12} md={3} className="bg-light">
      <h4>Right Sidebar</h4>
      {/* Add content here, e.g., user info, trending articles, etc. */}
      <p>User Profile</p>
      <ul>
        <li><a href="#">Trending Article 1</a></li>
        <li><a href="#">Trending Article 2</a></li>
        <li><a href="#">Trending Article 3</a></li>
      </ul>
    </Col>
  );
};

export default RightSidebar;
