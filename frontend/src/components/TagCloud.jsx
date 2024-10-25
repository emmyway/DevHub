import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ChevronDown, ChevronUp } from 'lucide-react'
import  TagBadge  from './ExploreTags';

export default function TagCloud({ tags, maxVisibleTags = 2, onTagClick, selectedTag }) {
  const [isOpen, setIsOpen] = useState(false)

  const visibleTags = tags.slice(0, maxVisibleTags)
  const hiddenTags = tags.slice(maxVisibleTags)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleTags.map((tag, index) => (
        <TagBadge 
          key={index} 
          tagName={tag} 
          selectedTag={selectedTag}
          onTagClick={onTagClick}
          defaultTagName=""  // We don't need a default tag here
        />
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
          <PopoverContent className="w-auto max-w-[200px] p-2 bg-gray-600 border-gray-700 rounded-md shadow-lg">
            <div className="flex flex-wrap gap-2">
              {hiddenTags.map((tag, index) => (
                <>
                <TagBadge 
                  key={index} 
                  tagName={tag} 
                  selectedTag={selectedTag}
                  onTagClick={onTagClick}
                  defaultTagName=""  // We don't need a default tag here
                />
                <hr style={{border: '1px ridge gray', width: '100%'}}/>
                </>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
