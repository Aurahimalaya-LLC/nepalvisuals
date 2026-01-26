import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MediaSelectorModal from '../../components/admin/MediaSelectorModal';
import { MediaService } from '../../lib/services/mediaService';

// Mock MediaService
vi.mock('../../lib/services/mediaService', () => ({
  MediaService: {
    getAllMedia: vi.fn()
  }
}));

const mockMediaFiles = [
    {
        id: '1',
        filename: 'mountain.jpg',
        file_path: 'mountain.jpg',
        mime_type: 'image/jpeg',
        size_bytes: 1024,
        width: 800,
        height: 600,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        public_url: 'http://example.com/mountain.jpg',
        title: 'Mountain View',
        alt_text: 'A beautiful mountain'
    },
    {
        id: '2',
        filename: 'river.png',
        file_path: 'river.png',
        mime_type: 'image/png',
        size_bytes: 2048,
        width: 400,
        height: 300,
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
        public_url: 'http://example.com/river.png',
        title: 'River Flow',
        alt_text: 'A flowing river'
    }
];

describe('MediaSelectorModal', () => {
    const mockOnClose = vi.fn();
    const mockOnSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(
            <MediaSelectorModal 
                isOpen={false} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );
        expect(screen.queryByText('Select Media')).toBeNull();
    });

    it('should render and fetch media when isOpen is true', async () => {
        vi.mocked(MediaService.getAllMedia).mockResolvedValue(mockMediaFiles as any);

        render(
            <MediaSelectorModal 
                isOpen={true} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );

        expect(screen.getByText('Select Media')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search by filename or title...')).toBeInTheDocument();
        
        // Wait for media to load
        await waitFor(() => {
            expect(screen.getByText('mountain.jpg')).toBeInTheDocument();
            expect(screen.getByText('river.png')).toBeInTheDocument();
        });

        expect(MediaService.getAllMedia).toHaveBeenCalledTimes(1);
    });

    it('should filter media based on search query', async () => {
        vi.mocked(MediaService.getAllMedia).mockResolvedValue(mockMediaFiles as any);

        render(
            <MediaSelectorModal 
                isOpen={true} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );

        await waitFor(() => {
            expect(screen.getByText('mountain.jpg')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search by filename or title...');
        fireEvent.change(searchInput, { target: { value: 'mountain' } });

        expect(screen.getByText('mountain.jpg')).toBeInTheDocument();
        expect(screen.queryByText('river.png')).toBeNull();
    });

    it('should handle selection and confirmation', async () => {
        vi.mocked(MediaService.getAllMedia).mockResolvedValue(mockMediaFiles as any);

        render(
            <MediaSelectorModal 
                isOpen={true} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );

        await waitFor(() => {
            expect(screen.getByText('mountain.jpg')).toBeInTheDocument();
        });

        // Click on the image to select it
        const imageCard = screen.getByText('mountain.jpg').closest('div')?.parentElement;
        fireEvent.click(imageCard!);

        // Confirm button should be enabled
        const confirmBtn = screen.getByText('Confirm Selection');
        expect(confirmBtn).toBeEnabled();

        fireEvent.click(confirmBtn);

        expect(mockOnSelect).toHaveBeenCalledWith('http://example.com/mountain.jpg');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle cancellation', async () => {
        render(
            <MediaSelectorModal 
                isOpen={true} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );

        const cancelBtn = screen.getByText('Cancel');
        fireEvent.click(cancelBtn);

        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should display error message if fetch fails', async () => {
        vi.mocked(MediaService.getAllMedia).mockRejectedValue(new Error('Fetch failed'));

        render(
            <MediaSelectorModal 
                isOpen={true} 
                onClose={mockOnClose} 
                onSelect={mockOnSelect} 
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Fetch failed')).toBeInTheDocument();
        });
    });
});
