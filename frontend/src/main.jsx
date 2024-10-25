import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DevHub from './pages/Index'
import PostView from './pages/PostView'
import CreatePost from './pages/CreatePost'
import Settings from "./pages/Settings";
import AuthPage from './pages/Auth';
import Bookmarks from './pages/Bookmarks';
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<DevHub />} />
        <Route path="/post/:id" element={<PostView />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)