import { useEffect, useState, useCallback } from 'react';
import { TourService, Tour } from '../services/tourService';

export function useToursByRegion(regionName: string | undefined) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = useCallback(async () => {
    if (!regionName) {
        setTours([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch only published tours for the region page
      const { data } = await TourService.getToursByRegion(regionName, { status: 'Published' });
      setTours(data);
    } catch (e: any) {
      console.error('Error fetching tours by region:', e);
      setError(e?.message || 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  }, [regionName]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  return { tours, loading, error, refresh: fetchTours };
}
