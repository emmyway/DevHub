import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/CreatePost.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, X, Maximize2, Minimize2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_URL = "http://127.0.0.1:5000";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const quillWrapperRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  useEffect(() => {
    fetchAvailableTags();
    const handleScroll = () => {
      if (quillWrapperRef.current && !isFullScreen) {
        const rect = quillWrapperRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 64);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFullScreen]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setIsSticky(false); // Disable sticky when going fullscreen
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch(`${API_URL}/get_tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.map(tag => tag.name));
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagClick = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddNewTag = () => {
    if (newTag && !tags.includes(newTag) && !availableTags.includes(newTag)) {
      setTags([...tags, newTag]);
      setAvailableTags([...availableTags, newTag]);
      setNewTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/create_post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: title,
          body: content,
          tags: tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      console.log(data.message);
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={`create-post-container ${isFullScreen ? 'fullscreen-mode' : ''}`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          {!isFullScreen && (
            <>
              <h1 className="text-3xl font-bold text-white mb-8">Create a New Post</h1>
              {error && <div className="text-red-500 mb-4">{error}</div>}
            </>
          )}
          <form onSubmit={handleSubmit} className="create-post-form">
            {!isFullScreen && (
              <>
                <div className="mb-6">
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your post title"
                    className="post-title-input"
                    required
                  />
                </div>
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a new tag"
                      className="post-tags-input"
                    />
                    <Button type="button" onClick={handleAddNewTag}>Add Tag</Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">Available tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="bg-gray-700 text-white px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            <div 
              ref={quillWrapperRef} 
              className={`quill-editor-wrapper ${isSticky ? 'sticky' : ''} ${isFullScreen ? 'fullscreen' : ''}`}
            >
              <div className="editor-toolbar">
                <Button
                  type="button"
                  onClick={toggleFullScreen}
                  className="fullscreen-toggle absolute top-1 right-6 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                  variant="ghost"
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-5 h-5 text-blue-200 hover:text-yellow-50" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-blue-200 hover:text-yellow-50" />
                  )}
                </Button>
              </div>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                className={`quill-editor ${isFullScreen ? 'fullscreen' : ''}`}
                placeholder="Write your post content here..."
              />
            </div>
            {!isFullScreen && (
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
