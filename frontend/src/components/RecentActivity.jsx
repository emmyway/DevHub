import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Clock, MessageSquare, Heart, Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_URL;

export default function RecentActivity({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'like': return <Heart className="w-4 h-4" />;
      case 'bookmark': return <Bookmark className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`${API_URL}/uploads/${activity.userAvatar}`} alt={activity.username} />
                  <AvatarFallback>{activity.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link to={`/post/${activity.postId}`} className="text-gray-200 hover:text-blue-400 transition-colors duration-200">
                    <p className="mb-1">
                      <span className="font-medium">{activity.username}</span> {activity.action} on "{activity.postTitle}"
                    </p>
                  </Link>
                  <div className="flex items-center text-gray-400 text-sm">
                    {getActivityIcon(activity.type)}
                    <span className="ml-1">{activity.timeAgo}</span>
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

// Prop validation
RecentActivity.propTypes = {
    activities: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        userAvatar: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        action: PropTypes.string.isRequired,
        postTitle: PropTypes.string.isRequired,
        postId: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        timeAgo: PropTypes.string.isRequired,
      })
    ).isRequired, // Array of activity objects
  };