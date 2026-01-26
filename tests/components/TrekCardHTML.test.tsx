import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrekCard } from '../../components/tour/TrekCard';
import { BrowserRouter } from 'react-router-dom';

const mockTrek = {
    id: '1',
    title: 'Test Trek',
    imageUrl: 'test.jpg',
    duration: '10 days',
    difficulty: 'Moderate',
    rating: 4.5,
    description: '<p>This is a <strong>bold</strong> description.</p>',
    maxAltitude: '5000m',
    price: 1000,
    link: '/trek/test'
};

describe('TrekCard HTML Rendering', () => {
    it('should render HTML content correctly without tags', () => {
        render(
            <BrowserRouter>
                <TrekCard trek={mockTrek} />
            </BrowserRouter>
        );

        // It should NOT display the raw tags
        expect(screen.queryByText('<p>This is a <strong>bold</strong> description.</p>')).not.toBeInTheDocument();
        
        // It SHOULD display the text content
        // Note: When using dangerouslySetInnerHTML, testing-library's getByText might struggle with nested tags
        // So we look for the text content within the bold tag to verify it rendered HTML
        expect(screen.getByText('bold')).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && content.includes('This is a') && content.includes('description.');
        })).toBeInTheDocument();
    });
});
