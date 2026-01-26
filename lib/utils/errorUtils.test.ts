import { describe, it, expect } from 'vitest';
import { mapTourLoadError } from './errorUtils';

describe('mapTourLoadError', () => {
  it('maps not found errors', () => {
    const e = new Error('Tour not found');
    const result = mapTourLoadError(e);
    expect(result.code).toBe('TOUR_NOT_FOUND');
    expect(result.title).toMatch(/Tour Not Found/i);
  });

  it('maps network errors', () => {
    const e = new Error('Failed to fetch network');
    const result = mapTourLoadError(e);
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.title).toMatch(/Network/i);
  });

  it('maps service errors', () => {
    const e = new Error('Supabase database error');
    const result = mapTourLoadError(e);
    expect(result.code).toBe('SERVICE_UNAVAILABLE');
    expect(result.title).toMatch(/Service Unavailable/i);
  });

  it('maps generic errors', () => {
    const e = new Error('Something went wrong');
    const result = mapTourLoadError(e);
    expect(result.code).toBe('GENERIC_ERROR');
    expect(result.title).toMatch(/Failed to Load Tour/i);
  });
});

