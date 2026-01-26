import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '../../lib/utils/htmlUtils';
import { DateCalculatorModal } from '../common/DateCalculatorModal';

export interface TrekCardProps {
  trek: {
    id: string;
    title: string;
    imageUrl: string;
    duration: string;
    difficulty: string;
    rating: number;
    description: string;
    maxAltitude: string;
    price: number;
    link: string;
  };
}

export const TrekCard: React.FC<TrekCardProps> = ({ trek }) => {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    
    // Extract number from duration string (e.g. "12 Days" -> 12)
    const durationDays = parseInt(trek.duration) || 0;

    return (
        <>
            {/* 
              Responsive Design Decisions:
              1. Fluid Layout: Uses w-full to adapt to the parent grid container.
              2. Aspect Ratio: Uses aspect-[4/3] for consistent image sizing across devices.
              3. Touch Targets: Action button is 48x48px (h-12 w-12) for mobile accessibility.
              4. Typography: Uses scalable text sizes and line-clamps for varying content length.
            */}
            <div className="group relative flex flex-col bg-surface-dark rounded-2xl border border-white/5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 overflow-hidden w-full">
                {/* Image Container: Fluid width with fixed aspect ratio */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <div 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCalculatorOpen(true);
                        }}
                        className="absolute top-4 right-4 z-10 bg-secondary/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-md cursor-pointer hover:bg-secondary transition-colors"
                        title="Click to calculate trip dates"
                        role="button"
                        aria-label={`Calculate dates for ${trek.duration} trip`}
                    >
                        {trek.duration}
                    </div>
                    {/* 
                      Image Optimization:
                      - loading="lazy" for performance
                      - object-cover to maintain aspect ratio filling the container
                      - transition for hover effect
                    */}
                    <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt={trek.title} 
                        src={trek.imageUrl} 
                        loading="lazy"
                        // Add sizes attribute for better browser image selection logic
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <div className="flex flex-col p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white pr-4">{trek.title}</h3>
                        <div className="flex items-center gap-1 text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-[18px]">star</span>
                            <span className="text-sm font-bold text-white">{trek.rating}</span>
                        </div>
                    </div>
                    <div className="text-text-secondary text-sm mb-4 line-clamp-2 flex-grow" dangerouslySetInnerHTML={{ __html: sanitizeHtml(trek.description) }} />
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary mb-4">
                        <span className="font-medium"><span className="text-primary font-bold">Altitude:</span> {trek.maxAltitude}</span>
                        <span className="font-medium"><span className="text-primary font-bold">Difficulty:</span> {trek.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                        <div>
                            <p className="text-xs text-text-secondary uppercase tracking-wide">From</p>
                            <p className="text-xl font-bold text-white">${trek.price}</p>
                        </div>
                        {/* Touch Target: Minimum 48x48px for mobile users */}
                        <Link to={trek.link} className="h-12 w-12 rounded-full bg-secondary hover:bg-primary text-white flex items-center justify-center transition-colors shadow-lg group-hover:scale-105" aria-label={`View details for ${trek.title}`}>
                            <span className="material-symbols-outlined">arrow_outward</span>
                        </Link>
                    </div>
                </div>
            </div>

            <DateCalculatorModal 
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                initialDuration={durationDays}
                title={`Plan Dates: ${trek.title}`}
            />
        </>
    );
};
