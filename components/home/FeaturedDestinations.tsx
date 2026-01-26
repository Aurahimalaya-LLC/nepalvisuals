import React, { useEffect, useState, useCallback, useRef } from 'react';
import { featuredDestinationService, FeaturedDestination } from '../../lib/services/featuredDestinationService';
import { databaseBootstrapper } from '../../lib/services/databaseBootstrapper';
import FeaturedDestinationsCarousel from './FeaturedDestinationsCarousel';

const FeaturedDestinations: React.FC = () => {
    const [destinations, setDestinations] = useState<FeaturedDestination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const bootstrapAttempted = useRef(false);
    
    // Create a ref for the carousel component to access its scroll methods
    const carouselRef = useRef<{ scrollLeft: () => void; scrollRight: () => void; canScrollLeft: boolean; canScrollRight: boolean }>(null);
    // Force re-render when scroll state changes in child
    const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

    const fetchDestinations = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Attempt bootstrap once per mount if we encounter a missing table error
        const attemptBootstrap = async () => {
            if (bootstrapAttempted.current) return;
            bootstrapAttempted.current = true;
            console.log('Attempting database bootstrap...');
            const result = await databaseBootstrapper.verifyAndCreateTables();
            if (result.success) {
                console.log('Bootstrap success, retrying fetch...');
                // Recursive call after success
                fetchDestinations();
            } else {
                console.warn('Bootstrap failed:', result.message);
            }
        };

        try {
            const data = await featuredDestinationService.getFeaturedDestinations();
            setDestinations(data);
        } catch (err: any) {
            console.error('Failed to load featured destinations:', err);
            
            // If table missing, try to bootstrap
            if (err.message?.includes('does not exist') || err.message?.includes('42P01')) {
                 if (!bootstrapAttempted.current) {
                     await attemptBootstrap();
                     return; // Exit current execution, the bootstrap will trigger retry
                 }
                 setError('System Error: Database table missing and auto-creation failed. Please run migration 20260107000018.');
            } else if (err.message?.includes('fetch')) {
                setError('Network Error: Unable to reach the server.');
            } else {
                setError('Unable to load destinations. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDestinations();
    }, [fetchDestinations, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    return (
        <section className="mb-24">
            <div className="flex items-end justify-between mb-10 px-2">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Featured Destinations</h2>
                    <p className="text-text-secondary">Curated adventures for the brave hearted.</p>
                </div>
                <div className="hidden md:flex gap-2">
                    <button 
                        onClick={() => carouselRef.current?.scrollLeft()}
                        disabled={!scrollState.canScrollLeft}
                        className={`h-10 w-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                            scrollState.canScrollLeft
                                ? 'bg-surface-dark hover:border-primary hover:text-primary text-white cursor-pointer'
                                : 'bg-surface-dark/50 text-white/20 cursor-not-allowed'
                        }`}
                        aria-label="Previous"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button 
                        onClick={() => carouselRef.current?.scrollRight()}
                        disabled={!scrollState.canScrollRight}
                        className={`h-10 w-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                            scrollState.canScrollRight
                                ? 'bg-surface-dark hover:border-primary hover:text-primary text-white cursor-pointer'
                                : 'bg-surface-dark/50 text-white/20 cursor-not-allowed'
                        }`}
                        aria-label="Next"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
            
            {error ? (
                <div className="text-center py-12 bg-surface-dark/50 rounded-2xl border border-white/5 mx-4">
                    <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error_outline</span>
                    <p className="text-red-300 mb-6 max-w-md mx-auto">{error}</p>
                    <button 
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/30"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Retry Loading
                    </button>
                </div>
            ) : (
                <FeaturedDestinationsCarousel 
                    destinations={destinations} 
                    loading={loading} 
                    error={error}
                    ref={carouselRef}
                    onScrollStateChange={setScrollState}
                />
            )}
        </section>
    );
};

export default FeaturedDestinations;
