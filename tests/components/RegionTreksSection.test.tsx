import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegionTreksSection } from '../../components/region/RegionTreksSection';
import * as useToursByRegionHook from '../../lib/hooks/useToursByRegion';
import { BrowserRouter } from 'react-router-dom';

// Mock the hook
vi.mock('../../lib/hooks/useToursByRegion', () => ({
    useToursByRegion: vi.fn()
}));

const mockTours = [
    {
        id: '1',
        name: 'Everest Base Camp',
        featured_image: 'image1.jpg',
        duration: '14 days',
        difficulty: 'Hard',
        price: 1500,
        description: 'A great trek',
        url_slug: 'everest-base-camp'
    },
    {
        id: '2',
        name: 'Annapurna Circuit',
        featured_image: null,
        duration: '12 days',
        difficulty: 'Moderate',
        price: 1200,
        description: 'Another great trek',
        url_slug: 'annapurna-circuit'
    }
];

describe('RegionTreksSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        vi.mocked(useToursByRegionHook.useToursByRegion).mockReturnValue({
            tours: [],
            loading: true,
            error: null,
            refresh: vi.fn()
        });

        render(<RegionTreksSection regionName="Everest Region" />);
        expect(screen.getByText('Loading treks...')).toBeInTheDocument();
    });

    it('renders error state', () => {
        vi.mocked(useToursByRegionHook.useToursByRegion).mockReturnValue({
            tours: [],
            loading: false,
            error: 'Failed to fetch',
            refresh: vi.fn()
        });

        render(<RegionTreksSection regionName="Everest Region" />);
        expect(screen.getByText('Error loading treks: Failed to fetch')).toBeInTheDocument();
    });

    it('renders empty state', () => {
        vi.mocked(useToursByRegionHook.useToursByRegion).mockReturnValue({
            tours: [],
            loading: false,
            error: null,
            refresh: vi.fn()
        });

        render(<RegionTreksSection regionName="Everest Region" />);
        expect(screen.getByText('No treks found for Everest Region yet.')).toBeInTheDocument();
    });

    it('renders treks', () => {
        vi.mocked(useToursByRegionHook.useToursByRegion).mockReturnValue({
            tours: mockTours,
            loading: false,
            error: null,
            refresh: vi.fn()
        } as any);

        render(
            <BrowserRouter>
                <RegionTreksSection regionName="Everest Region" />
            </BrowserRouter>
        );

        expect(screen.getByText('Everest Base Camp')).toBeInTheDocument();
        expect(screen.getByText('Annapurna Circuit')).toBeInTheDocument();
        expect(screen.getByText('$1500')).toBeInTheDocument();
        expect(screen.getByText('14 days')).toBeInTheDocument();
    });
});
