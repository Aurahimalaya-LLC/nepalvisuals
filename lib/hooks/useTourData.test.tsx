import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useTourData } from './useTourData';
import { Tour } from '../services/tourService';
import * as TourServiceModule from '../services/tourService';

vi.mock('../services/tourService', () => ({
  TourService: {
    getTourById: vi.fn(),
    updateTour: vi.fn(),
    deleteTour: vi.fn(),
  },
}));

const TestComponent: React.FC<{ id: string }> = ({ id }) => {
  const { tour, loading, error, refetch } = useTourData({ id, refetchInterval: 0 });
  return (
    <div>
      <div>loading:{String(loading)}</div>
      <div>error:{error || ''}</div>
      <div>tour:{tour?.name || ''}</div>
      <button onClick={() => refetch()}>refetch</button>
    </div>
  );
};

const makeTour = (overrides: Partial<Tour> = {}): Tour => ({
  id: overrides.id ?? 't1',
  name: overrides.name ?? 'Tour',
  url_slug: overrides.url_slug ?? 'tour',
  destination: overrides.destination ?? null,
  region: overrides.region ?? null,
  country: overrides.country ?? 'Nepal',
  category: overrides.category ?? 'Adventure',
  status: overrides.status ?? 'Draft',
  price: overrides.price ?? 0,
  duration: overrides.duration ?? '14',
  difficulty: overrides.difficulty ?? 'Moderate',
  guide_language: overrides.guide_language ?? null,
  tour_type: overrides.tour_type ?? null,
  description: overrides.description ?? 'Desc',
  meta_title: overrides.meta_title ?? null,
  meta_description: overrides.meta_description ?? null,
  featured_image: overrides.featured_image ?? null,
  itineraries: overrides.itineraries ?? [],
  tour_highlights: overrides.tour_highlights ?? [],
  seasonal_prices: overrides.seasonal_prices ?? [],
  group_discounts: overrides.group_discounts ?? [],
});

describe('useTourData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tour successfully', async () => {
    const tour = makeTour({ name: 'Everest Base Camp', status: 'Published' });
    (TourServiceModule.TourService.getTourById as any).mockResolvedValue(tour);

    await act(async () => {
      render(<TestComponent id="t1" />);
    });

    expect(screen.getByText(/loading:false/)).toBeTruthy();
    expect(screen.getByText(/error:/)).toBeTruthy();
    expect(screen.getByText(/tour:Everest Base Camp/)).toBeTruthy();
  });

  it('handles errors gracefully', async () => {
    (TourServiceModule.TourService.getTourById as any).mockRejectedValue(new Error('Tour not found'));

    await act(async () => {
      render(<TestComponent id="missing" />);
    });

    expect(screen.getByText(/loading:false/)).toBeTruthy();
    expect(screen.getByText(/error:Tour not found/)).toBeTruthy();
  });

  it('refetches data', async () => {
    (TourServiceModule.TourService.getTourById as any)
      .mockResolvedValueOnce(makeTour({ name: 'First' }))
      .mockResolvedValueOnce(makeTour({ name: 'Second' }));

    await act(async () => {
      render(<TestComponent id="t1" />);
    });

    expect(screen.getByText(/tour:First/)).toBeTruthy();

    await act(async () => {
      screen.getByRole('button', { name: /refetch/i }).click();
    });

    expect(screen.getByText(/tour:Second/)).toBeTruthy();
  });
});
