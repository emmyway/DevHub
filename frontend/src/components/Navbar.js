import React from 'react';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';

const CustomNavbar = () => {
  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <div className="container">
        {/* Brand Name or Logo */}
        <Navbar.Brand href="/home" className="fw-bold text-primary">
          DevHub
        </Navbar.Brand>

        {/* Navbar Toggle for mobile view */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Search Bar centered */}
          <Form className="mx-auto d-flex align-items-center">
            <input
              type="text"
              placeholder="Search articles"
              className="form-control me-2 rounded-pill"
              style={{ maxWidth: '300px' }}
            />
            <Button variant="outline-primary" className="rounded-pill px-4">
              Search
            </Button>
          </Form>

          {/* Right-aligned navigation links */}
          <Nav className="ms-auto">
            <Nav.Link href="/home" className="text-dark fw-bold bg-light">
              Home
            </Nav.Link>
            <Nav.Link href="/login" className="text-dark fw-bold">
              Logout
            </Nav.Link>
            <Button href="/create" variant="primary" className="ms-3 rounded-pill px-4">
              Create Post
            </Button>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default CustomNavbar;
