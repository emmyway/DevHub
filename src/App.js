import React from 'react';
import { Button, Navbar, Container } from 'react-bootstrap';

function App() {
  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">DevHub Clone</Navbar.Brand>
        </Container>
      </Navbar>

      <div className="container mt-5">
        <h1>Welcome to DevHub Clone!</h1>
        <Button variant="primary">Get Started</Button>
      </div>
    </div>
  );
}

export default App;
