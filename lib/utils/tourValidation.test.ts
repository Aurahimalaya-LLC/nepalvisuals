import { describe, it, expect } from 'vitest';
import { validateTourForDisplay } from './tourValidation';
import { Tour } from '../services/tourService';

const baseTour: Tour = {
  id: 't1',
  name: 'Test Tour',
  url_slug: 'test-tour',
  destination: null,
  region: null,
  country: 'Nepal',
  category: 'Adventure',
  status: 'Draft',
  price: 1000,
  duration: '14',
  difficulty: 'Moderate',
  guide_language: null,
  tour_type: null,
  description: 'A great trek',
  meta_title: null,
  meta_description: null,
  featured_image: null,
  itineraries: [],
  tour_highlights: [],
  seasonal_prices: [],
  group_discounts: [],
};

describe('validateTourForDisplay', () => {
  it('validates a complete tour', () => {
    const res = validateTourForDisplay(baseTour);
    expect(res.isValid).toBe(true);
    expect(res.missingFields).toHaveLength(0);
  });

  it('detects missing required fields', () => {
    const t = { ...baseTour, name: '', url_slug: '' };
    const res = validateTourForDisplay(t);
    expect(res.isValid).toBe(false);
    expect(res.missingFields).toContain('name');
    expect(res.missingFields).toContain('url_slug');
  });

  it('adds warnings for published tours missing content', () => {
    const t = { ...baseTour, status: 'Published' as const, description: '', region: '', country: '' };
    const res = validateTourForDisplay(t);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});
