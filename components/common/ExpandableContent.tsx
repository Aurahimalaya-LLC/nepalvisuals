import React, { useState, useRef, useEffect } from 'react';
import { sanitizeHtml } from '../../lib/utils/htmlUtils';

interface ExpandableContentProps {
  content: string;
  maxHeight?: number; // Height in pixels for collapsed state, default approx 7 lines
  className?: string;
}

export const ExpandableContent: React.FC<ExpandableContentProps> = ({ 
  content, 
  maxHeight = 180, // Approximate height for 6-7 lines (assuming ~1.5rem line height * 1.25)
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Check if content height exceeds maxHeight
      setShouldShowButton(contentRef.current.scrollHeight > maxHeight);
    }
  }, [content, maxHeight]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={contentRef}
        className={`transition-all duration-500 ease-in-out overflow-hidden relative ${isExpanded ? 'max-h-[2000px]' : ''}`}
        style={{ 
            maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : `${maxHeight}px`,
        }}
      >
        <div 
          className="text-white leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
        
        {/* Gradient Overlay for collapsed state */}
        {!isExpanded && shouldShowButton && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background-dark to-transparent pointer-events-none"></div>
        )}
      </div>

      {shouldShowButton && (
        <button
          onClick={toggleExpand}
          className="mt-4 flex items-center gap-2 text-primary hover:text-primary-dark font-bold text-sm uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark rounded-md px-2 py-1"
          aria-expanded={isExpanded}
          aria-controls="overview-content"
        >
          <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
          <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
      )}
    </div>
  );
};
