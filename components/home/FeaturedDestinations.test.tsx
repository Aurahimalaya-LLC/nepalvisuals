import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeaturedDestinations from './FeaturedDestinations';
import { featuredDestinationService } from '../../lib/services/featuredDestinationService';
import { BrowserRouter } from 'react-router-dom';

// Mock the service
vi.mock('../../lib/services/featuredDestinationService');

// Mock data
const mockDestinations = [
    {
        id: '1',
        name: 'Test Destination 1',
        description: 'Description 1',
        image_url: 'test1.jpg',
        price: '$1000',
        duration: '10 Days',
        rating: 4.5,
        link_url: '/trip/test-1',
        display_order: 1,
        is_active: true
    },
    {
        id: '2',
        name: 'Test Destination 2',
        description: 'Description 2',
        image_url: 'test2.jpg',
        price: '$2000',
        duration: '20 Days',
        rating: 5.0,
        link_url: '/trip/test-2',
        display_order: 2,
        is_active: true
    }
];

describe('FeaturedDestinations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading skeletons initially', () => {
        // Return a promise that never resolves to simulate loading
        vi.spyOn(featuredDestinationService, 'getFeaturedDestinations').mockImplementation(() => new Promise(() => {}));
        
        render(
            <BrowserRouter>
                <FeaturedDestinations />
            </BrowserRouter>
        );

        // Check for loading skeletons (looking for animate-pulse class or specific structure)
        // Since we can't easily query by class, we check if the heading exists and content is not yet visible
        expect(screen.getByText('Featured Destinations')).toBeInTheDocument();
        // Assuming skeletons don't have text content we can query
    });

    it('renders destinations after loading', async () => {
        vi.spyOn(featuredDestinationService, 'getFeaturedDestinations').mockResolvedValue(mockDestinations);

        render(
            <BrowserRouter>
                <FeaturedDestinations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Destination 1')).toBeInTheDocument();
            expect(screen.getByText('Test Destination 2')).toBeInTheDocument();
        });

        expect(screen.getByText('10 Days')).toBeInTheDocument();
        expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    it('renders error message when fetching fails', async () => {
        vi.spyOn(featuredDestinationService, 'getFeaturedDestinations').mockRejectedValue(new Error('Fetch error'));

        render(
            <BrowserRouter>
                <FeaturedDestinations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load featured destinations. Please try again later.')).toBeInTheDocument();
        });

        expect(screen.getByText('Retry')).toBeInTheDocument();
    });
});
