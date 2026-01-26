import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegionPage from './RegionPage';

vi.mock('../lib/hooks/useRegionsData', () => ({
  useRegionsData: () => ({
    regions: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

describe('RegionPage dynamic builder', () => {
  it('renders dynamic builder when region is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/region/unknown-region']}>
        <Routes>
          <Route path="/region/:regionName" element={<RegionPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Create Region Page/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});

