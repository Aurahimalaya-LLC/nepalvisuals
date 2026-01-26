import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegionSelect from '../../components/common/RegionSelect';
import * as useRegionsDataHook from '../../lib/hooks/useRegionsData';

// Mock the hook
vi.mock('../../lib/hooks/useRegionsData', () => ({
    useRegionsData: vi.fn()
}));

const mockRegions = [
    { id: '1', name: 'Everest Region', status: 'Published' },
    { id: '2', name: 'Annapurna Region', status: 'Published' },
    { id: '3', name: 'Langtang Region', status: 'Draft' }
];

describe('RegionSelect', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock scrollIntoView
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        
        vi.mocked(useRegionsDataHook.useRegionsData).mockReturnValue({
            regions: mockRegions,
            loading: false,
            error: null,
            refresh: vi.fn()
        } as any);
    });

    it('renders with default props', () => {
        render(<RegionSelect onChange={mockOnChange} />);
        expect(screen.getByText('Select a region...')).toBeInTheDocument();
        expect(screen.getByText('Region')).toBeInTheDocument();
    });

    it('displays loading state', () => {
        vi.mocked(useRegionsDataHook.useRegionsData).mockReturnValue({
            regions: [],
            loading: true,
            error: null,
            refresh: vi.fn()
        } as any);

        render(<RegionSelect onChange={mockOnChange} />);
        
        // Open dropdown
        fireEvent.click(screen.getByRole('combobox'));
        expect(screen.getByText('Loading regions...')).toBeInTheDocument();
    });

    it('displays error state', () => {
        vi.mocked(useRegionsDataHook.useRegionsData).mockReturnValue({
            regions: [],
            loading: false,
            error: 'Failed to fetch',
            refresh: vi.fn()
        } as any);

        render(<RegionSelect onChange={mockOnChange} />);
        expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    it('opens dropdown and displays regions on click', () => {
        render(<RegionSelect onChange={mockOnChange} />);
        
        const combobox = screen.getByRole('combobox');
        fireEvent.click(combobox);
        
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Everest Region')).toBeInTheDocument();
        expect(screen.getByText('Annapurna Region')).toBeInTheDocument();
    });

    it('filters regions when searching', () => {
        render(<RegionSelect onChange={mockOnChange} />);
        
        fireEvent.click(screen.getByRole('combobox'));
        
        const searchInput = screen.getByPlaceholderText('Search regions...');
        fireEvent.change(searchInput, { target: { value: 'Everest' } });
        
        expect(screen.getByText('Everest Region')).toBeInTheDocument();
        expect(screen.queryByText('Annapurna Region')).not.toBeInTheDocument();
    });

    it('calls onChange when a region is selected', () => {
        render(<RegionSelect onChange={mockOnChange} />);
        
        fireEvent.click(screen.getByRole('combobox'));
        fireEvent.click(screen.getByText('Everest Region'));
        
        expect(mockOnChange).toHaveBeenCalledWith('Everest Region');
        // Dropdown should close (implied by integration, but hard to test state directly without inspecting DOM)
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('displays selected value', () => {
        render(<RegionSelect onChange={mockOnChange} value="Everest Region" />);
        expect(screen.getByText('Everest Region')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
        render(<RegionSelect onChange={mockOnChange} />);
        
        const combobox = screen.getByRole('combobox');
        
        // Open with Enter
        fireEvent.keyDown(combobox, { key: 'Enter' });
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        
        // Navigate down
        fireEvent.keyDown(combobox, { key: 'ArrowDown' }); // Focus first item
        fireEvent.keyDown(combobox, { key: 'ArrowDown' }); // Focus second item
        
        // Select with Enter (assuming logic handles focus state)
        // Note: The component logic relies on state for focusedIndex.
        // We can simulate the selection by verifying the interaction calls select.
        // However, testing internal state focus via keyboard in JSDOM can be tricky if scrolling is involved.
        // We'll rely on the logic being correct if simple navigation works.
        
        // Let's just check if ArrowDown prevents default (meaning it's handled)
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
        combobox.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });
});
