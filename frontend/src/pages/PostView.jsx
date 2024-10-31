import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correct import
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Navbar from '../components/Navbar';
import Overlay from '../components/Overlay';
import TagBadge from '../components/ExploreTags'; // Make sure the import path is correct
import { Skeleton } from '../components/ui/skeleton';
import '../styles/PostView.css';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Send,
  Edit,
  Trash2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  // Function to get the JWT token
  const getToken = () => {
    return localStorage.getItem('token') || ''; // Get token from localStorage
  };

  // Function to get current user ID from token
  const getCurrentUserId = () => {
    try {
      const token = getToken();
      const decoded = jwtDecode(token);
      return decoded.sub; // Assuming 'sub' contains the user ID
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPostDetails(id);
  }, [id]);

  useEffect(() => {
    if (post) {
      setLikeCount(post.likes);
      checkIfLiked();
    }
  }, [post]);

  const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/get_post/${postId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok (posts)');
      }
      const data = await response.json();
      setPost(data);
      setIsLiked(data.isLiked);
      setComments(data.comments || []);

      // Check if current user is the post owner
      const currentUserId = getCurrentUserId();
      setIsOwner(currentUserId === data.host_id);

      // Fetch bookmark status
      fetchBookmarkStatus(postId);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const fetchBookmarkStatus = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/is_bookmarked/${postId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok (bookmark status)');
      }
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error('Error fetching bookmark status:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  const handleLike = async () => {
    if (!isAuthenticated) {
      setOverlayMessage('Please log in to like this post.');
      setShowLoginOverlay(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/like_post/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to like/unlike post');
      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likes);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const checkIfLiked = async () => {
    try {
      const response = await fetch(`${API_URL}/is_liked/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to check like status');
      const data = await response.json();
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`${API_URL}/add_comment/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ content: newComment }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
  };

  const handleDelete = () => {
    setIsDeleteOverlayOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/delete_post/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
    setIsDeleteOverlayOpen(false);
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      setOverlayMessage('Please log in to bookmark this post.');
      setShowLoginOverlay(true);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/bookmark_post/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  const handleShare = () => {
    // Implement share functionality (e.g., copy link to clipboard)
    const postUrl = window.location.href;
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/like_comment/${commentId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: data.likes, isLiked: data.isLiked }
            : comment
        )
      );
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/delete_comment/${commentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Remove the deleted comment from the state
      setComments(comments.filter((comment) => comment.id !== commentToDelete));
      setCommentToDelete(null); // Reset the commentToDelete state
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Dummy click handler that does nothing
  const handleTagClick = () => {};

  const navigateToLogin = () => {
    navigate('/auth');
    setShowLoginOverlay(false);
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-gray-100 pt-8 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-12 w-3/4 mb-4 bg-gray-800" />
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full bg-gray-800" />
              <div>
                <Skeleton className="h-6 w-40 mb-2 bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-4 bg-gray-800" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </div>
            <Skeleton className="h-10 w-full mt-8 mb-4 bg-gray-800" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/4 mb-2 bg-gray-800" />
                  <Skeleton className="h-3 w-full bg-gray-800" />
                  <Skeleton className="h-3 w-full bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar showWriteStory={true} />
      <div
        className="mx-auto px-[5%] lg:0 py-8 sm:max-w-[90%] md:max-w-[80%] post-content"
        style={{ backgroundColor: '#111827' }}
      >
        <Button
          variant="ghost"
          className="mb-4 text-blue-400 hover:text-blue-600"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Button>
        <article className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16">
                {' '}
                {/* Container to control overall size */}
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={
                      post.host_avatar
                        ? `${API_URL}/uploads/${post.host_avatar}`
                        : null
                    }
                    alt={post.host_username || 'User'}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl flex items-center justify-center w-full h-full">
                    {post.host_username
                      ? post.host_username[0].toUpperCase()
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {post.host_username}
                </h2>
                <p className="text-sm text-gray-400">
                  Posted on {new Date(post.created).toLocaleDateString()} •{' '}
                  {post.readTime} min read
                </p>
              </div>
              <Bookmark
                className={`w-7 h-7 cursor-pointer transition-all duration-200 transform hover:scale-125 text-yellow-400  hover:fill-yellow-400/25 ${
                  isBookmarked ? ' fill-yellow-400' : ''
                }`}
                onClick={handleBookmark}
              />
            </div>
            <div className="flex space-x-2">
              {isOwner ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-white hover:bg-blue-600 transition-colors duration-200"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 bg-red-400/10 hover:text-white hover:bg-red-500 transition-colors duration-200"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-${
                    isLiked ? 'red' : 'gray'
                  }-400 hover:text-white hover:bg-red-600 transition-colors duration-200`}
                  onClick={handleLike}
                >
                  <Heart
                    className={`w-7 h-7 mr-1 ${isLiked ? 'fill-current' : ''}`}
                  />
                  <span className="hidden sm:inline">
                    {isLiked ? 'Liked' : 'Like'}
                  </span>
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags &&
              post.tags.map((tag, index) => (
                <TagBadge
                  key={index}
                  tagName={tag}
                  selectedTag="" // No tag is selected in this view
                  onTagClick={handleTagClick}
                  defaultTagName="" // Assuming there's no default tag in this view
                />
              ))}
          </div>
          <div className="prose prose-invert max-w-none post-content text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>
        </article>
        <hr className="my-6 border-gray-700 mt-20 mb-20" />
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-2 ${
                    isLiked ? 'text-red-500' : 'text-gray-400'
                  } hover:text-red-600 transition-colors duration-200`}
                  onClick={handleLike}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? 'fill-current' : 'stroke-current'
                    }`}
                  />
                  <span>{likeCount} Likes</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-400"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>{comments.length} Comments</span>
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Bookmark
                  className={`w-7 h-7 cursor-pointer transition-all duration-200 transform hover:scale-125 text-yellow-400  hover:fill-yellow-400/25 ${
                    isBookmarked ? ' fill-yellow-400' : ''
                  }`}
                  onClick={handleBookmark}
                />
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-400"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-2xl font-bold text-white">Comments</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        comment.author.avatar
                          ? `${API_URL}/uploads/${comment.author.avatar}`
                          : null
                      }
                      alt={comment.author.name}
                    />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        {comment.author.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-400'
                          } hover:text-red-600 transition-colors duration-200`}
                          onClick={() => handleCommentLike(comment.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              comment.isLiked
                                ? 'fill-current'
                                : 'stroke-current'
                            }`}
                          />
                          <span>{comment.likes}</span>
                        </Button>
                        {comment.author.id === getCurrentUserId() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <Separator className="bg-gray-700" />
          <CardFooter className="flex space-x-2 pt-4">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            <Button
              onClick={handleComment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-5 h-5 mr-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Overlay
        isOpen={isDeleteOverlayOpen}
        onClose={() => setIsDeleteOverlayOpen(false)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isDestructive={true}
      />
      <Overlay
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteComment}
        isDestructive={true}
      />
      <Overlay
        isOpen={showLoginOverlay}
        onClose={() => setShowLoginOverlay(false)}
        title="Login Required"
        message={overlayMessage}
        confirmText="Login"
        cancelText="Cancel"
        onConfirm={navigateToLogin}
        isDestructive={false}
      />
    </>
  );
}
