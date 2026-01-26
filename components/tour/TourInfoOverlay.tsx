import React from 'react';
import { Tour } from '../../lib/services/tourService';

interface TourInfoOverlayProps {
    tour: Tour;
    averageRating: number;
    reviewCount: number;
    onShareClick: () => void;
}

export const TourInfoOverlay: React.FC<TourInfoOverlayProps> = ({ tour, averageRating, reviewCount, onShareClick }) => {
    return (
        <div className="container mx-auto px-4 pb-16 pt-32 max-w-7xl w-full h-full flex flex-col justify-end min-h-[70vh]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pointer-events-auto">
                <div className="w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm mb-6">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{tour.region || 'Nepal'}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                        {tour.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-sm md:text-base font-medium text-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">star</span>
                            <span>{averageRating} ({reviewCount} Reviews)</span>
                        </div>
                        <button
                            onClick={onShareClick}
                            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group"
                            aria-label="Share this trip"
                        >
                            <span className="material-symbols-outlined text-primary group-hover:text-primary-dark transition-colors">share</span>
                            <span>Share Trip</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
