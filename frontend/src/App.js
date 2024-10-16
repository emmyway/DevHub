import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MyNavbar from './components/Navbar';
import ArticleList from './pages/ArticleList';
import ArticleDetails from './pages/ArticleDetails';
import CreateArticle from './pages/CreateArticle';
import MainLayout from './components/MainLayout';
import SignIn from './pages/Login';
import Signup from './pages/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Router>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<SignIn />} exact/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<MainLayout />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/create" element={<CreateArticle />} />
        <Route path="/articles/:id" element={<ArticleDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
