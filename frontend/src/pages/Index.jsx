import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  Bell,
  BookMarked,
  Search,
  User,
  ChevronDown,
  Clock,
  Eye,
  PenSquare,
  Settings,
  LogOut,
  BookmarkPlus,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
} from 'lucide-react';
import SafeHTML from '../components/SafeHTML';
import Navbar from '../components/Navbar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import TagBadge from '../components/ExploreTags';
import TagCloud from '../components/TagCloud';
import { Skeleton } from '../components/ui/skeleton';

const API_URL = 'http://127.0.0.1:5000';

export default function DevHub() {
    const defaultTagName = 'Explore All'
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trendingStories, setTrendingStories] = useState([]);
  const [selectedTag, setSelectedTag] = useState(defaultTagName);
  const [tags, setTags] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  setIsAuthenticated(!!token);
}, []);
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchPosts(),
            fetchTrendingStories(),
            fetchTags(),
            fetchRecentActivities()
        ]);
        setIsLoading(false);
    };

    fetchData();
  }, [currentPage, selectedTag]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/get_posts?page=${currentPage}&tag=${selectedTag === defaultTagName ? '' : selectedTag}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched posts:', data.posts); // Debug log
      setPosts(data.posts || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };

  const fetchTrendingStories = async () => {
    try {
      const response = await fetch(`${API_URL}/trending_stories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTrendingStories(data);
    } catch (error) {
      console.error('Error fetching trending stories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/get_tags`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTags(data);
      console.log('Fetched tags:', tags); // Add this line to check fetched tags
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/recent_activities`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities');
      }
      const data = await response.json();
      setRecentActivities(data);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const handleReadArticle = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsDropdownOpen(false); // Close the dropdown after clicking
  };
  
  const handleTagClick = (tagName) => {
    //   setSelectedTag(defaultTagName);
    setSelectedTag(tagName);
    setCurrentPage(1);
    // console.log('====================================');
    // console.log("IN handle",defaultTagName);
    // console.log('====================================');
};
// setInterval(() => {
//     console.log('====================================');
//     console.log("patrol",selectedTag);
//     console.log('====================================');
// }, 10000);

  const MAX_VISIBLE_TAGS = 2;
  const MAX_TAG_LENGTH = 12;

  const truncateTag = (tag) => {
    if (tag.length <= MAX_TAG_LENGTH) return tag;
    return (
      <span className="relative">
        {tag.substring(0, MAX_TAG_LENGTH)}
        <span className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-700 to-transparent"></span>
      </span>
    );
  };

  const truncateMessage = (message, maxLength) => {
    if (message.length <= maxLength) return message;
    return message.substr(0, maxLength - 3) + '...';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const visibleTags = showAllTags ? tags : tags.slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar showWriteStory={false} />
        <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-7 lg:grid-cols-4 gap-8">
          <aside className="md:col-span-2 lg:col-span-1">
            <Skeleton className="h-8 w-3/4 mb-4 bg-gray-800" />
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 bg-gray-800" />
              ))}
            </div>
          </aside>
          <div className="md:col-span-5 lg:col-span-2 border-l-0 md:border-l border-gray-800 md:pl-8">
            <Skeleton className="h-10 w-full mb-6 bg-gray-800" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-6 w-3/4 mb-2 bg-gray-800" />
                <Skeleton className="h-4 w-full mb-1 bg-gray-800" />
                <Skeleton className="h-4 w-full mb-1 bg-gray-800" />
                <Skeleton className="h-4 w-2/3 bg-gray-800" />
              </div>
            ))}
          </div>
          <aside className="md:col-span-7 md:px-20 md:pt-16 lg:col-span-1 mt-8 lg:px-0 md:border-t border-gray-800">
            <Skeleton className="h-8 w-full mb-4 bg-gray-800" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full mb-2 bg-gray-800" />
            ))}
            <Skeleton className="h-8 w-full mt-6 mb-4 bg-gray-800" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full mb-2 bg-gray-800" />
            ))}
          </aside>
        </main>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar showWriteStory={false} />
        <main className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-400">Welcome to DevHub!</h2>
          <p className="text-xl mb-6">You're the first to land here. Be the first to create a post and start the community!</p>
          {isAuthenticated ? (
            <Link to="/create-post">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-lg">
                Write a Story
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-lg">
                Get Started
              </Button>
            </Link>
          )}
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-900 text-gray-100 ${
        isDropdownOpen ? 'overflow-hidden' : ''
      }`}
    >
      <div
        className={`${
          isDropdownOpen ? 'filter blur-sm transition-all duration-300' : ''
        }`}
      >
        <Navbar showWriteStory={false} />
        <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-7 lg:grid-cols-4 gap-8">
          <aside className="md:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Explore tags
            </h2>
            <div className="flex flex-wrap gap-2">
              <TagBadge
        key="explore-all"
        tagName={defaultTagName}
        selectedTag={selectedTag}
        defaultTagName={defaultTagName}
        onTagClick={handleTagClick}
        />
            {visibleTags.map((tag, index) => (
                <TagBadge
                key={index} 
                tagName={tag.name} 
                selectedTag={selectedTag}
                defaultTagName={defaultTagName} 
                onTagClick={handleTagClick}/>
            ))}
            {tags.length > 8 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors duration-200"
              >
                {showAllTags ? 'Less' : 'More...'}
              </button>
            )}
            </div>
          </aside>
          <div className="md:col-span-5 lg:col-span-2 border-l-0 md:border-l border-gray-800 md:pl-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 
            border-t border-b md:border-t-0 md:border-b-0 border-gray-700 py-4 md:py-0">
              <div className="flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0 md:px-4 w-full">
                {isAuthenticated && (
                  <Link to="/create-post" className="order-1 md:order-2">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      <PenSquare className="w-4 h-4 mr-2" />
                      Write a Story
                    </Button>
                  </Link>
                )}
                <h2 className="text-2xl font-bold text-blue-400 order-2 md:order-1">
                  Developer Stories
                </h2>
              </div>
            </div>
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage
                            src={`${API_URL}/uploads/${post.host_avatar}`}
                            alt="User"
                          />
                        </Avatar>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                        <span className="font-medium text-blue-400">
                          {post.host_username || 'Anonymous'}
                        </span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <TagCloud
                          tags={post.tags}
                          maxVisibleTags={2}
                          onTagClick={handleTagClick}
                          selectedTag={selectedTag}
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/post/${post.id}`} className="block">
                      <h3 className="text-xl font-semibold mb-2 text-white hover:text-blue-400 transition-colors duration-200">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-400">
                      <SafeHTML
                        html={
                          post.body.length > 150
                            ? `${post.body.substring(0, 150)}...`
                            : post.body
                        }
                      />
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(post.created).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                      onClick={() => handleReadArticle(post.id)}
                    >
                      Read Article
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          <aside className="md:col-span-7 md:px-20 md:pt-16 lg:pt-8 lg:col-span-1 mt-8 lg:px-0 md:border-t lg:border-t-0 border-gray-800">
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-400">Trending Stories</h3>
              </CardHeader>
              <CardContent>
                {trendingStories.length > 0 ? (
                  <ul className="space-y-2">
                    {trendingStories.map((story, index) => (
                      <li key={story.id} className="flex items-start space-x-2">
                        <span className="text-gray-500 font-bold">{index + 1}.</span>
                        <Link to={`/post/${story.id}`} className="text-gray-300 hover:text-blue-400 flex-grow">
                          {story.title}
                        </Link>
                        <span className="text-gray-400 flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {story.likes}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No trending stories yet.</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-400">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <ul className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <li key={index} className="lg:text-sm text-gray-300">
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' '}
                        {activity.action}
                        {' '}
                        <Link to={`/post/${activity.post.id}`} className="text-blue-400 hover:underline">
                          {truncateMessage(activity.post.title, 30)}
                        </Link>
                        <p className="text-sm lg:text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
