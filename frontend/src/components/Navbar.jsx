import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Bell,
  BookMarked,
  Search,
  Settings,
  LogOut,
  PenSquare,
  User,
  Loader2,
  X,
  Menu,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_URL;

export default function Navbar({ showWriteStory = true }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchUserData();
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/current_user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const currentUser = await response.json();
      setUserData(currentUser);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/auth');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setSearchResults(null);
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleBookmarksClick = () => {
    navigate('/bookmarks');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const renderSearchResults = () => (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Posts</h3>
          {searchResults.posts.length > 0 ? (
            searchResults.posts.map((post) => (
              <div
                key={post.id}
                className="mb-4 hover:bg-gray-800 p-3 rounded-lg transition duration-150 ease-in-out"
              >
                <Link
                  to={`/post/${post.id}`}
                  className="block text-white font-medium text-lg mb-1 hover:text-blue-400 transition-colors duration-200"
                >
                  {post.title}
                </Link>
                <p
                  className="text-gray-400 text-sm mb-2"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      truncateText(stripHtml(post.body), 150)
                    ),
                  }}
                />
                <div className="flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span>{post.host_username}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.created).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No posts found</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Users</h3>
          {searchResults.users.length > 0 ? (
            searchResults.users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center mb-4 hover:bg-gray-800 p-3 rounded-lg transition duration-150 ease-in-out"
              >
                <Avatar className="mr-3">
                  <AvatarImage
                    src={
                      user.profile_pic
                        ? `${API_URL}/uploads/${user.profile_pic}`
                        : null
                    }
                  />
                  <AvatarFallback className="bg-blue-500">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-white font-medium">{user.username}</h4>
                  <p className="text-gray-400 text-sm">{user.full_name}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400">No users found</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <motion.div
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <h1 className="text-2xl font-bold">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                      Dev
                    </span>
                    <span className="text-gray-200">Hub</span>
                  </h1>
                </motion.div>
              </Link>
            </div>

            <div className="hidden md:flex md: items-center space-x-4 flex-grow justify-center">
              <div
                className="relative w-full max-w-md md:max-w-lg lg:max-w-2xl"
                ref={searchRef}
              >
                <form
                  onSubmit={handleSearch}
                  className="relative md:w-[80%] md:ml-8 lg:w-[90%]"
                >
                  <Input
                    className="w-full pl-10 pr-10 py-2 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 rounded-full"
                    placeholder="Discover stories, thinking, and expertise..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-1"
                      onClick={clearSearch}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-1"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </form>
                <AnimatePresence>
                  {showSearchResults && searchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 bg-gray-900 border border-gray-800 shadow-lg max-h-[70vh] overflow-y-auto rounded-lg mt-2"
                    >
                      {renderSearchResults()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:block">
                    {showWriteStory && (
                      <Link to="/create-post">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                          <PenSquare className="w-4 h-4 mr-2" />
                          Write a Story
                        </Button>
                      </Link>
                    )}
                  </div>
                  <DropdownMenu onOpenChange={setIsDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <div className="relative cursor-pointer hidden md:block">
                        <Avatar>
                          <AvatarImage
                            src={`${API_URL}/uploads/${userData.profile_pic}`}
                            alt="User"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {userData.username
                              ? userData.username[0].toUpperCase()
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          3
                        </Badge>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 bg-gray-800 border-gray-700 text-gray-100 p-2 rounded-lg shadow-lg z-50 relative">
                      <DropdownMenuLabel className="text-blue-400 font-bold text-lg pb-2">
                        {userData.firstName} {userData.lastName}
                      </DropdownMenuLabel>
                      <span className="ml-3">@{userData.username}</span>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem className="focus:bg-gray-700 focus:text-blue-400 rounded-md p-2 cursor-pointer transition-colors duration-200">
                        <Bell className="mr-2 h-5 w-5" />
                        <span>Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="focus:bg-gray-700 focus:text-blue-400 rounded-md p-2 cursor-pointer transition-colors duration-200"
                        onClick={handleBookmarksClick}
                      >
                        <BookMarked className="mr-2 h-5 w-5" />
                        <span>Bookmarks</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="focus:bg-gray-700 focus:text-blue-400 rounded-md p-2 cursor-pointer transition-colors duration-200"
                        onClick={handleSettingsClick}
                      >
                        <Settings className="mr-2 h-5 w-5" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        className="focus:bg-gray-700 focus:text-blue-400 rounded-md p-2 cursor-pointer transition-colors duration-200"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="hidden md:flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Login
                </Button>
              )}
              <Button
                className="md:hidden text-white"
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-gray-900 border-t border-gray-800 text-white"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    className="w-full pl-10 pr-10 py-2 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500 rounded-full"
                    placeholder="Search..."
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-1"
                      onClick={clearSearch}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white rounded-full p-1"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </form>
                {showSearchResults && searchResults && (
                  <div className="bg-gray-700 rounded-lg overflow-hidden border border-gray-500">
                    {renderSearchResults()}
                  </div>
                )}
                {isAuthenticated ? (
                  <>
                    {showWriteStory && (
                      <Link
                        to="/create-post"
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                          <PenSquare className="w-4 h-4 mr-2" />
                          Write a Story
                        </Button>
                      </Link>
                    )}
                    <Button
                      className="w-full text-left justify-start"
                      variant="ghost"
                      onClick={() => {
                        navigate('/notifications');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      <span>Notifications</span>
                    </Button>
                    <Button
                      className="w-full text-left justify-start"
                      variant="ghost"
                      onClick={() => {
                        handleBookmarksClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <BookMarked className="mr-2 h-5 w-5" />
                      <span>Bookmarks</span>
                    </Button>
                    <Button
                      className="w-full text-left justify-start"
                      variant="ghost"
                      onClick={() => {
                        handleSettingsClick();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      <span>Settings</span>
                    </Button>
                    <div className="flex flex-row space-x-4 p-4 bg-gray-800 rounded-lg justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={`${API_URL}/uploads/${userData.profile_pic}`}
                            alt="User"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {userData.username
                              ? userData.username[0].toUpperCase()
                              : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-lg font-semibold text-white">
                            {userData.firstName} {userData.lastName}
                          </h2>
                          <p className="text-sm text-gray-400">
                            @{userData.username}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="text-right justify-end bg-gray-700"
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
}

Navbar.propTypes = {
  showWriteStory: PropTypes.bool, // Optional boolean for showing the write story button
};
