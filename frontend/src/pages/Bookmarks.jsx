import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bookmark, Calendar, User, ExternalLink } from 'lucide-react';   
import { Skeleton } from '../components/ui/skeleton';
import Navbar from "../components/Navbar";

const API_URL = 'http://127.0.0.1:5000';

export default function Bookmarks() {
    const [bookmarks, setBookmarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/bookmarks`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            const data = await response.json();
            setBookmarks(data);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <Navbar showWriteStory={true}/>
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to DevHub
                </Link>
                <h1 className="text-3xl font-bold text-white mb-8">Your Bookmarks</h1>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <Card key={index} className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 bg-gray-700" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-1/2 bg-gray-700 mb-2" />
                                    <Skeleton className="h-4 w-1/4 bg-gray-700" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : bookmarks.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookmarks.map((bookmark) => (
                            <Card key={bookmark.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle>
                                        <Link to={`/post/${bookmark.id}`} className="text-xl font-semibold text-white hover:text-blue-400 transition-colors duration-200">
                                            {bookmark.title}
                                        </Link>
                                    </CardTitle>
                                    <CardDescription className="flex items-center text-gray-400">
                                        <User className="mr-1 h-4 w-4" />
                                        {bookmark.host_username || 'Anonymous'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {bookmark.description || 'No description available.'}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center text-gray-500 text-xs">
                                            <Calendar className="mr-1 h-4 w-4" />
                                            {new Date(bookmark.created).toLocaleDateString()}
                                        </span>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/post/${bookmark.id}`} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                                                Read More
                                                <ExternalLink className="ml-1 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bookmark className="h-16 w-16 text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg mb-4">You haven't bookmarked any posts yet.</p>
                            <Button asChild>
                                <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
                                    Explore DevHub
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
        </>
    );
}