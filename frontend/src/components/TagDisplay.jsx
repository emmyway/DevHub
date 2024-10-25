import React, { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDown, ChevronUp, Compass, Hash } from 'lucide-react';

export default function TagDisplay({
  tags,
  maxVisibleTags = 2,
  onTagClick,
  selectedTag,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleTags = tags.slice(0, maxVisibleTags);
  const hiddenTags = tags.slice(maxVisibleTags);

  const ALL_TAGS_LABEL = 'Explore All';

  const TagBadge = ({ tag }) => {
    if (tag === ALL_TAGS_LABEL) {
      return (
        <Button
          variant="outline"
          size="sm"
          className={`
            flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full
            ${
              tag === selectedTag
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-gray-200'
                : 'bg-gray-600 text-gray-300 border-gray-400 hover:bg-gray-700 hover:text-gray-100 hover:border-gray-500'
            }
            transition-colors duration-200
          `}
          onClick={() => onTagClick && onTagClick(tag)}
        >
          <Compass size={14} />
          <span>{ALL_TAGS_LABEL}</span>
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className={`
          px-3 py-1 text-sm font-medium rounded-full
          ${
            tag === selectedTag
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:text-gray-200'
              : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-gray-100 hover:border-gray-500'
          }
          transition-colors duration-200
        `}
        onClick={() => onTagClick && onTagClick(tag)}
      >
        {tag}
      </Button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleTags.map((tag, index) => (
        <TagBadge key={index} tag={tag} />
      ))}
      {hiddenTags.length > 0 && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-full"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-w-[200px] p-2 bg-gray-800 border-gray-700 rounded-md shadow-lg">
            <div className="flex flex-wrap gap-2">
              {hiddenTags.map((tag, index) => (
                <TagBadge key={index} tag={tag} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
