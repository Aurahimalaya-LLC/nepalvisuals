import { useState, useEffect, useCallback, useRef } from 'react';
import { Tour, TourService } from '../services/tourService';
import { supabase } from '../supabaseClient';

export interface UseTourDataOptions {
  id: string;
  enabled?: boolean;
  refetchInterval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: Tour) => void;
  isSlug?: boolean;
}

export interface UseTourDataReturn {
  tour: Tour | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTour: (updates: Partial<Tour>) => Promise<void>;
  deleteTour: () => Promise<void>;
  isRefetching: boolean;
}

export const useTourData = ({
  id,
  enabled = true,
  refetchInterval = 0,
  onError,
  onSuccess,
  isSlug = false
}: UseTourDataOptions): UseTourDataReturn => {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null);
  
  // Use refs for callbacks to prevent infinite loops when inline functions are passed
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const fetchTour = useCallback(async () => {
    if (!enabled || !id) return;

    try {
      setLoading(true);
      setError(null);

      const maxAttempts = 3;
      let attempt = 0;
      let lastError: any = null;

      while (attempt < maxAttempts) {
        try {
          // Dynamically choose fetch method based on ID type
          const data = isSlug 
            ? await TourService.getTourBySlug(id) 
            : await TourService.getTourById(id);
            
          setTour(data);
          if (onSuccessRef.current) onSuccessRef.current(data);
          lastError = null;
          break;
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || err).toLowerCase();
          const isNetworkError = msg.includes('failed to fetch') || msg.includes('network');
          attempt++;
          if (!isNetworkError || attempt >= maxAttempts) {
            throw err;
          }
          await new Promise(res => setTimeout(res, 500 * attempt));
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tour data';
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [id, enabled, isSlug]);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    await fetchTour();
  }, [fetchTour]);

  const updateTour = useCallback(async (updates: Partial<Tour>) => {
    if (!tour) return;

    try {
      const updatedTour = await TourService.updateTour(tour.id, updates);
      setTour(updatedTour);
      
      if (onSuccessRef.current) {
        onSuccessRef.current(updatedTour);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update tour';
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
      
      throw err;
    }
  }, [tour]);

  const deleteTour = useCallback(async () => {
    if (!tour) return;

    try {
      await TourService.deleteTour(tour.id);
      setTour(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete tour';
      setError(errorMessage);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
      
      throw err;
    }
  }, [tour]);

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled || !tour?.id) return;

    const tourId = tour.id;

    const setupSubscription = async () => {
      try {
        subscriptionRef.current = supabase
          .channel(`tour:${tourId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tours',
              filter: `id=eq.${tourId}`
            },
            () => {
              // Refetch full data to ensure relations (highlights, etc.) are preserved/updated
              fetchTour();
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tour_highlights',
              filter: `tour_id=eq.${tourId}`
            },
            () => {
              fetchTour();
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to set up real-time subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [tour?.id, enabled, fetchTour]);

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval > 0 && enabled) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, refetch]);

  // Initial fetch
  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  return {
    tour,
    loading,
    error,
    refetch,
    updateTour,
    deleteTour,
    isRefetching
  };
};
