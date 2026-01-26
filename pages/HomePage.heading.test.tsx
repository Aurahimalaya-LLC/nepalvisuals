import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

vi.mock('../lib/hooks/useRegionsData', () => ({
  useRegionsData: () => ({
    regions: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('../lib/hooks/useRegionTripStats', () => ({
  useRegionTripStats: () => ({
    stats: [],
  }),
}));

describe('HomePage heading DOM manipulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays "Regions" in the Activities heading', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Regions' });
    expect(heading).toBeInTheDocument();
  });

  it('retains styling and layout classes on heading', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Regions' });
    expect(heading).toHaveClass('text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight');
  });

  it('associated functionality and controls remain present and usable', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    const regionsList = screen.getByLabelText('Available regions');
    expect(regionsList).toBeInTheDocument();
    const left = screen.getByRole('button', { name: /chevron_left/i });
    const right = screen.getByRole('button', { name: /chevron_right/i });
    fireEvent.click(left);
    fireEvent.click(right);
    expect(left).toBeVisible();
    expect(right).toBeVisible();
  });
});

