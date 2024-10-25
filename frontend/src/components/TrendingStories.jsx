import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Eye, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const API_URL = 'http://127.0.0.1:5000'; // Adjust this as needed

export default function TrendingStories({ stories }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Trending Stories</h2>
      <div className="space-y-4">
        {stories.map((story) => (
          <Card key={story.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <Link to={`/post/${story.id}`} className="text-gray-200 hover:text-blue-400 transition-colors duration-200">
                <h3 className="font-medium mb-2">{story.title}</h3>
              </Link>
              <div className="flex items-center justify-between text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={`${API_URL}/uploads/${story.authorAvatar}`} alt={story.authorName} />
                    <AvatarFallback>{story.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span>{story.authorName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{story.views} views</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{story.readTime} min read</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
