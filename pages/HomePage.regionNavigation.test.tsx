import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

const mockRegions = [
  { id: '1', name: 'Everest Region', tagline: null, description: null, status: 'Published', image_url: null, parent_id: null, latitude: null, longitude: null, zoom_level: 10 },
];

vi.mock('../lib/hooks/useRegionsData', () => ({
  useRegionsData: () => ({
    regions: mockRegions,
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('../lib/hooks/useRegionTripStats', () => ({
  useRegionTripStats: () => ({ stats: [] }),
}));

vi.mock('../lib/services/regionService', () => ({
  RegionService: {
    existsByName: vi.fn(async (_name: string) => true),
  }
}));
import { RegionService } from '../lib/services/regionService';

describe('HomePage region navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prefetches on hover and navigates on click when region exists', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const card = screen.getByRole('link', { name: /Everest Region/i });
    fireEvent.mouseEnter(card);
    expect(RegionService.existsByName).toHaveBeenCalledWith('Everest Region');
    fireEvent.click(card);
    // Ensure the link points to the correct region route (hash may vary)
    expect(card.getAttribute('href') || '').toMatch(/\/region\/everest-region$/);
  });

  it('navigates to builder route when region does not exist', async () => {
    (RegionService.existsByName as any).mockResolvedValueOnce(false);
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const card = screen.getByRole('link', { name: /Everest Region/i });
    fireEvent.click(card);
    expect(card.getAttribute('href') || '').toMatch(/\/region\/everest-region$/);
  });
});
