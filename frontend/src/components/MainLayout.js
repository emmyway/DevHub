import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ArticleList from '../pages/ArticleList';

const MainLayout = () => {
  return (
    <Container fluid>
      <Row>
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content Area */}
        <Col xs={12} md={6}>
              <span className="d-flex mx-2 h2 justify-content-around">
                <Link to="#" className="text-decoration-none">Relevant </Link>
                <Link to="#" className="text-decoration-none">Latest </Link>
                <Link to="#" className="text-decoration-none">Top</Link>
              </span>
          {/* Main articles will be rendered here */}
           <div>
            <ArticleList />
          </div>
        </Col>

        {/* Right Sidebar */}
        <RightSidebar />
      </Row>
    </Container>
  );
};

export default MainLayout;
