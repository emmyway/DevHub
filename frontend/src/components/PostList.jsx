import React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import TagCloud from './TagCloud';

export default function PostList({ posts }) {
  return (
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
                  onTagClick={() => {}} // Implement if needed
                  selectedTag=""
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Add post content here */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
