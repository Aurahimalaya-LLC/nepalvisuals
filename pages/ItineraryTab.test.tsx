import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ItineraryTab } from './AdminTrekEditorPage';
import { TourService } from '../lib/services/tourService';

// Mock TourService
vi.mock('../lib/services/tourService', () => ({
  TourService: {
    addItineraryItem: vi.fn(),
    updateItineraryItem: vi.fn(),
    deleteItineraryItem: vi.fn(),
  }
}));

// Mock window.confirm
const confirmSpy = vi.spyOn(window, 'confirm');

describe('ItineraryTab', () => {
  const mockRefreshTour = vi.fn();
  const mockTour = {
    id: 'tour-123',
    itineraries: [
      {
        id: 'item-1',
        tour_id: 'tour-123',
        day_number: 1,
        title: 'Day 1: Arrival',
        description: 'Arrive in Kathmandu',
        accommodation: 'Hotel',
        meals: 'Dinner'
      },
      {
        id: 'item-2',
        tour_id: 'tour-123',
        day_number: 2,
        title: 'Day 2: Sightseeing',
        description: 'Visit temples',
        accommodation: 'Hotel',
        meals: 'Breakfast'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    confirmSpy.mockImplementation(() => true); // Default confirm to true
  });

  it('renders the itinerary list correctly', () => {
    render(<ItineraryTab tour={mockTour} refreshTour={mockRefreshTour} />);
    
    expect(screen.getByText('Day 1: Arrival')).toBeInTheDocument();
    expect(screen.getByText('Arrive in Kathmandu')).toBeInTheDocument();
    expect(screen.getByText('Day 2: Sightseeing')).toBeInTheDocument();
  });

  it('shows empty state when no itineraries', () => {
    render(<ItineraryTab tour={{ id: 'tour-123', itineraries: [] }} refreshTour={mockRefreshTour} />);
    
    expect(screen.getByText('No itinerary days added yet.')).toBeInTheDocument();
  });

  it('allows adding a new itinerary item', async () => {
    render(<ItineraryTab tour={mockTour} refreshTour={mockRefreshTour} />);
    
    // Click Add Day button
    fireEvent.click(screen.getByText('Add Day'));
    
    // Check if form appears
    expect(screen.getByText('Add New Day')).toBeInTheDocument();
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Day' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New Description' } });
    
    // Save
    vi.mocked(TourService.addItineraryItem).mockResolvedValue({} as any);
    fireEvent.click(screen.getByText('Save Day'));
    
    await waitFor(() => {
      expect(TourService.addItineraryItem).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Day',
        description: 'New Description'
      }));
      expect(mockRefreshTour).toHaveBeenCalled();
    });
  });

  it('allows editing an existing item', async () => {
    render(<ItineraryTab tour={mockTour} refreshTour={mockRefreshTour} />);
    
    // Find edit button for first item
    const editButtons = screen.getAllByText('edit');
    fireEvent.click(editButtons[0]);
    
    // Check if form appears with data
    expect(screen.getByDisplayValue('Day 1: Arrival')).toBeInTheDocument();
    
    // Change title
    fireEvent.change(screen.getByDisplayValue('Day 1: Arrival'), { target: { value: 'Updated Day 1' } });
    
    // Save
    vi.mocked(TourService.updateItineraryItem).mockResolvedValue({} as any);
    fireEvent.click(screen.getByText('Save Day'));
    
    await waitFor(() => {
      expect(TourService.updateItineraryItem).toHaveBeenCalledWith('item-1', expect.objectContaining({
        title: 'Updated Day 1'
      }));
      expect(mockRefreshTour).toHaveBeenCalled();
    });
  });

  it('allows deleting an item', async () => {
    render(<ItineraryTab tour={mockTour} refreshTour={mockRefreshTour} />);
    
    const deleteButtons = screen.getAllByText('delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(confirmSpy).toHaveBeenCalled();
    
    vi.mocked(TourService.deleteItineraryItem).mockResolvedValue(undefined);
    
    await waitFor(() => {
        expect(TourService.deleteItineraryItem).toHaveBeenCalledWith('item-1');
        expect(mockRefreshTour).toHaveBeenCalled();
    });
  });

  it('renders a large list of itineraries efficiently', () => {
    const largeItineraries = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      tour_id: 'tour-123',
      day_number: i + 1,
      title: `Day ${i + 1}`,
      description: `Description for day ${i + 1}`,
      accommodation: 'Hotel',
      meals: 'Breakfast'
    }));

    const start = performance.now();
    render(<ItineraryTab tour={{ id: 'tour-123', itineraries: largeItineraries }} refreshTour={mockRefreshTour} />);
    const end = performance.now();
    
    expect(screen.getByText('Day 50')).toBeInTheDocument();
    // Just a sanity check that it doesn't take unreasonably long (e.g. > 1s for 50 items)
    // Note: Render time depends on environment, but 50 items is small for React.
    expect(end - start).toBeLessThan(1000); 
  });
});
