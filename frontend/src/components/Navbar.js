import React from 'react';
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import logo from '../holberton-logo.jpg'; // Update the path to your logo image

const CustomNavbar = () => {
  return (
    <div>
    
      <Navbar bg="light" expand="lg" clasName="mb-5">
      <Navbar.Brand href="#home">
        <img
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
          alt="Logo"
        />{' '}
        DevHub
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Form inline align-top className="mx-auto">
          <input
            type="text"
            placeholder="Search"
            className="py-1"
          />
          <Button variant="outline-primary">Search</Button>
        </Form>

        <Nav className="ml-auto">
          <Nav.Link href="/" variant="outline-primary" className="btn btn-primary">Login</Nav.Link>
          <Nav.Link href="/create" variant="outline-primary" className="btn btn-primary">Create Post</Nav.Link>
        </Nav>
      </Navbar.Collapse>
      </Navbar>
   
  </div>
  );
};

export default CustomNavbar;
