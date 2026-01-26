import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HeroSearch } from '../../components/home/HeroSearch';
import { TourService } from '../../lib/services/tourService';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../lib/services/tourService', () => ({
    TourService: {
        getAllTours: vi.fn()
    }
}));

// Mock debounce
vi.mock('../../lib/hooks/useDebounce', () => ({
    useDebounce: (value: any) => value
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

const mockTours = [
    {
        id: '1',
        name: 'Everest Base Camp',
        url_slug: 'everest-base-camp',
        featured_image: 'everest.jpg',
        duration: '14 days',
        difficulty: 'Hard',
        status: 'Published' as 'Published',
        destination: null,
        region: null,
        country: null,
        category: null,
        price: 0,
        guide_language: null,
        tour_type: null,
        description: null,
        meta_title: null,
        meta_description: null
    }
];

describe('HeroSearch Redirect', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to trip page on suggestion click', async () => {
        vi.mocked(TourService.getAllTours).mockResolvedValue({ data: mockTours, count: 1 });

        render(
            <BrowserRouter>
                <HeroSearch />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Where do you want to go?');
        
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Everest' } });
        });

        await waitFor(() => {
            expect(screen.getByText('Everest Base Camp')).toBeInTheDocument();
        });

        const suggestion = screen.getByText('Everest Base Camp');
        fireEvent.click(suggestion);

        expect(mockNavigate).toHaveBeenCalledWith('/trek/everest-base-camp', {
            state: { fromSearch: true, searchQuery: 'Everest' }
        });
    });

    it('displays error if tour url_slug is missing', async () => {
        const invalidTour = [{ ...mockTours[0], url_slug: '' }];
        vi.mocked(TourService.getAllTours).mockResolvedValue({ data: invalidTour, count: 1 });

        render(
            <BrowserRouter>
                <HeroSearch />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Where do you want to go?');
        
        await act(async () => {
            fireEvent.change(input, { target: { value: 'Everest' } });
        });

        await waitFor(() => {
            expect(screen.getByText('Everest Base Camp')).toBeInTheDocument();
        });

        const suggestion = screen.getByText('Everest Base Camp');
        fireEvent.click(suggestion);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(screen.getByText('Invalid tour URL')).toBeInTheDocument();
    });
});
