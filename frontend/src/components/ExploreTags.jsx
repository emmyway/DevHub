import React from 'react';
import { Button } from './ui/button';
import { Compass } from 'lucide-react';

export default function TagBadge({ tagName, selectedTag, onTagClick, defaultTagName }) {
  if (tagName === defaultTagName) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`
              flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full
              ${
                tagName === selectedTag
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-gray-200'
                  : 'bg-gray-600 text-gray-300 border-gray-400 hover:bg-gray-700 hover:text-gray-100 hover:border-gray-500'
              }
              transition-colors duration-200
            `}
        onClick={() => onTagClick(tagName)}
      >
        <Compass size={14} />
        <span>{tagName}</span>
      </Button>
    );
  } else {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`
            px-3 py-1 text-sm font-medium rounded-full
            ${
              tagName === selectedTag
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-gray-200'
                : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-100 hover:border-gray-500'
            }
            transition-colors duration-200
          `}
        onClick={() => onTagClick(tagName)}
      >
        {tagName}
      </Button>
    );
  }
}
