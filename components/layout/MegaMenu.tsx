import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRegionsData } from '../../lib/hooks/useRegionsData';
import { useToursByRegion } from '../../lib/hooks/useToursByRegion';
import { Region } from '../../lib/services/regionService';
import LoadingSpinner from '../common/LoadingSpinner';

const RegionTrekList = ({ regionName }: { regionName: string }) => {
    const { tours, loading, error } = useToursByRegion(regionName);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-red-400">
                <span className="material-symbols-outlined mb-2">error_outline</span>
                <p className="text-sm">Unable to load treks</p>
            </div>
        );
    }

    if (tours.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-text-secondary">
                <span className="material-symbols-outlined mb-2 text-3xl opacity-50">landscape</span>
                <p className="text-sm">No treks found for this region yet.</p>
            </div>
        );
    }

    // Display max 4 treks to fit the menu layout
    const displayedTours = tours.slice(0, 4);

    return (
        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
            {displayedTours.map(tour => (
                <Link 
                    to={`/trip/${tour.url_slug}`} 
                    key={tour.id} 
                    className="group flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                >
                     <img 
                        src={tour.featured_image || 'https://placehold.co/100x100?text=Trek'} 
                        alt={tour.name} 
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-surface-darker"
                    />
                    <div className="flex flex-col justify-center min-w-0">
                        <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors truncate w-full mb-1">
                            {tour.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                {tour.duration ? `${tour.duration} Days` : 'N/A'}
                            </span>
                            <span className="w-0.5 h-0.5 bg-text-secondary rounded-full"></span>
                            <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">hiking</span>
                                {tour.difficulty || 'Moderate'}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
             <Link 
                to={`/region/${regionName.toLowerCase().replace(/\s+/g, '-')}`} 
                className="col-span-2 text-center text-sm font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 group"
            >
                View All {regionName} Treks 
                <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
        </div>
    );
};

export const MegaMenu: React.FC = () => {
    const { regions, loading: regionsLoading } = useRegionsData();
    const [activeRegion, setActiveRegion] = useState<Region | null>(null);

    // Set first region as active by default once loaded
    useEffect(() => {
        if (regions.length > 0 && !activeRegion) {
            setActiveRegion(regions[0]);
        }
    }, [regions, activeRegion]);

    return (
        <div className="w-[700px] lg:w-[900px] max-w-[95vw] bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-12 z-50 animate-fadeIn origin-top-center">
             {/* Left Sidebar - Regions */}
            <div className="col-span-3 bg-surface-darker/50 border-r border-white/5 py-4 flex flex-col">
                <div className="px-6 mb-4">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Regions</p>
                </div>
                {regionsLoading ? (
                     <div className="px-6 py-4 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                     </div>
                ) : (
                    <ul className="space-y-1 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {regions.map(region => (
                            <li key={region.id}>
                                <button
                                    onMouseEnter={() => setActiveRegion(region)}
                                    className={`w-full text-left px-6 py-3 text-sm font-bold transition-all flex items-center justify-between group relative ${
                                        activeRegion?.id === region.id 
                                        ? 'text-white bg-white/5' 
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {activeRegion?.id === region.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                                    )}
                                    <span className="truncate">{region.name}</span>
                                    {activeRegion?.id === region.id && (
                                        <span className="material-symbols-outlined text-lg text-primary">chevron_right</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Right Content - Treks */}
            <div className="col-span-9 p-8 bg-surface-dark/50 min-h-[400px]">
                {activeRegion ? (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">{activeRegion.name}</h3>
                                <p className="text-sm text-text-secondary line-clamp-1 max-w-md">
                                    {activeRegion.tagline || 'Explore the breathtaking landscapes and trails.'}
                                </p>
                            </div>
                            <Link 
                                to={`/region/${activeRegion.name?.toLowerCase().replace(/\s+/g, '-')}`} 
                                className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1"
                            >
                                Region Details
                                <span className="material-symbols-outlined text-base">arrow_outward</span>
                            </Link>
                        </div>
                        <div className="flex-grow">
                            <RegionTrekList regionName={activeRegion.name || ''} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-text-secondary">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">map</span>
                            <p>Select a region to view treks</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
