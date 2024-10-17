import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import MyNavbar from './components/Navbar';
import ArticleList from './pages/ArticleList';
import ArticleDetails from './pages/ArticleDetails';
import CreateArticle from './pages/CreateArticle';
import MainLayout from './components/MainLayout';
import SignIn from './pages/Login';
import Signup from './pages/Signup';
import EditPost from './pages/EditPost';
import LandingPage from './pages/LandingPage';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const location = useLocation();

  // Define path where navbar should not be shown
  const noNavbarPaths = ['/', '/login', '/signup'];
  return (
    <>
      {/* conditionally render the navbar */}
      {!noNavbarPaths.includes(location.pathname) && <MyNavbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} exact/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/home" element={<MainLayout />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/create" element={<CreateArticle />} />
        <Route path="/articles/:id" element={<ArticleDetails />} />
        <Route path="/edit-post/:id" element={<EditPost />} />
      </Routes>
    </>
  );
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
