import React from 'react';
import { TourHighlight } from '../../lib/services/tourService';

interface TourHighlightsProps {
    highlights: TourHighlight[];
    className?: string;
}

const TourHighlights: React.FC<TourHighlightsProps> = ({ highlights, className = '' }) => {
    if (!highlights || highlights.length === 0) return null;

    // Filter only visible highlights and sort by display_order
    const visibleHighlights = highlights
        .filter(h => h.is_visible)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (visibleHighlights.length === 0) return null;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
            {visibleHighlights.map((highlight) => (
                <div 
                    key={highlight.id} 
                    className="group bg-surface-dark rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 flex flex-col h-full hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                    {/* Image Section - Only render if image_url exists */}
                    {highlight.image_url && (
                        <div className="relative h-48 overflow-hidden flex-shrink-0">
                            <img 
                                src={highlight.image_url} 
                                alt={highlight.title || highlight.text} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-60"></div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                            {highlight.title || 'Untitled Highlight'}
                        </h3>
                        
                        {/* Description - Render HTML content safely */}
                        {highlight.text && (
                            <div 
                                className="text-text-secondary text-sm leading-relaxed prose prose-invert prose-sm max-w-none line-clamp-4"
                                dangerouslySetInnerHTML={{ __html: highlight.text }}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TourHighlights;
