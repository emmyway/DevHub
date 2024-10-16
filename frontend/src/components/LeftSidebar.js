import React from 'react';
import { Col } from 'react-bootstrap';

const LeftSidebar = () => {
  return (
    <Col xs={12} md={3} className="bg-light">
      <h4>Left Sidebar</h4>
      {/* Add content here, e.g., tags, categories, etc. */}
      <ul>
        <li><a href="#">Tag 1</a></li>
        <li><a href="#">Tag 2</a></li>
        <li><a href="#">Tag 3</a></li>
      </ul>
    </Col>
  );
};

export default LeftSidebar;
