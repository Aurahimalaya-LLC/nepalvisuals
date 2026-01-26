import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TourService } from './tourService';

vi.mock('../supabaseClient', async () => {
  const actual = await vi.importActual('../supabaseClient');
  return {
    ...actual,
    supabase: {
      from: vi.fn(),
      auth: {
        getSession: vi.fn()
      }
    }
  };
});

import { supabase } from '../supabaseClient';

describe('TourService - Pricing Section Fixes', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle });
    mockEq.mockReturnValue({ single: mockSingle });
    mockOrder.mockReturnValue({ data: null, error: null });
    mockSingle.mockReturnValue({ data: null, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: () => ({ select: () => ({ single: mockSingle }) }) });
    mockDelete.mockReturnValue({ eq: mockEq });
    
    vi.mocked(supabase.from).mockImplementation(mockFrom);
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete
    });
  });

  describe('createTour', () => {
    it('should create tour with essential pricing fields only', async () => {
      const mockTour = {
        name: 'Everest Base Camp Trek',
        url_slug: 'everest-base-camp-trek',
        price: 1500,
        currency: 'USD',
        status: 'Published' as const
      };

      const expectedResponse = { data: { id: '123', ...mockTour }, error: null };
      mockSingle.mockReturnValue(expectedResponse);

      const result = await TourService.createTour(mockTour);

      expect(result).toEqual(expectedResponse.data);
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Everest Base Camp Trek',
        url_slug: 'everest-base-camp-trek',
        price: 1500,
        currency: 'USD',
        status: 'Published'
      });
    });

    it('should handle price validation errors', async () => {
      const invalidTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: -100, // Invalid negative price
        currency: 'USD'
      };

      const dbError = { message: 'Price cannot be negative' };
      mockSingle.mockReturnValue({ data: null, error: dbError });

      await expect(TourService.createTour(invalidTour)).rejects.toThrow('Price cannot be negative');
    });

    it('should strip non-existent fields like price_includes/excludes', async () => {
      const tourWithInvalidFields = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        currency: 'USD',
        price_includes: 'Meals, accommodation', // This field doesn't exist in DB
        price_excludes: 'Flights, personal expenses' // This field doesn't exist in DB
      };

      const expectedResponse = { data: { id: '123', name: 'Test Tour', url_slug: 'test-tour', price: 1000, currency: 'USD' }, error: null };
      mockSingle.mockReturnValue(expectedResponse);

      const result = await TourService.createTour(tourWithInvalidFields);

      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        currency: 'USD'
      });
      expect(result).toEqual(expectedResponse.data);
    });
  });

  describe('updateTour', () => {
    it('should update tour with essential pricing fields', async () => {
      const tourId = '123';
      const updates = {
        price: 1800,
        currency: 'EUR'
      };

      const expectedResponse = { data: { id: tourId, price: 1800, currency: 'EUR' }, error: null };
      mockSingle.mockReturnValue(expectedResponse);

      const result = await TourService.updateTour(tourId, updates);

      expect(result).toEqual(expectedResponse.data);
      expect(mockUpdate).toHaveBeenCalledWith({
        price: 1800,
        currency: 'EUR',
        updated_at: expect.any(String)
      });
    });

    it('should handle database errors gracefully', async () => {
      const tourId = '123';
      const updates = { price: 2000 };
      
      const dbError = { message: 'Database connection failed' };
      mockSingle.mockReturnValue({ data: null, error: dbError });

      await expect(TourService.updateTour(tourId, updates)).rejects.toThrow('Database connection failed');
    });
  });

  describe('getTourById', () => {
    it('should retrieve tour with pricing data', async () => {
      const tourId = '123';
      const mockTour = {
        id: tourId,
        name: 'Annapurna Circuit',
        price: 1200,
        currency: 'USD',
        status: 'Published'
      };

      const expectedResponse = { data: mockTour, error: null };
      mockSingle.mockReturnValue(expectedResponse);

      const result = await TourService.getTourById(tourId);

      expect(result).toEqual(mockTour);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', tourId);
    });

    it('should handle tour not found', async () => {
      const tourId = 'nonexistent';
      const notFoundError = { message: 'Tour not found' };
      mockSingle.mockReturnValue({ data: null, error: notFoundError });

      await expect(TourService.getTourById(tourId)).rejects.toThrow('Tour not found');
    });
  });

  describe('Price Validation', () => {
    it('should accept valid price ranges', async () => {
      const validPrices = [0, 100, 999999, 1500.50];
      
      for (const price of validPrices) {
        const tour = {
          name: 'Test Tour',
          url_slug: 'test-tour',
          price: price,
          currency: 'USD'
        };

        const expectedResponse = { data: { id: '123', ...tour }, error: null };
        mockSingle.mockReturnValue(expectedResponse);

        const result = await TourService.createTour(tour);
        expect(result.price).toBe(price);
      }
    });

    it('should handle edge cases for price validation', async () => {
      const edgeCases = [
        { price: 1000000, shouldFail: true }, // Too high
        { price: -1, shouldFail: true },      // Negative
        { price: NaN, shouldFail: true },   // Not a number
        { price: Infinity, shouldFail: true } // Infinity
      ];

      for (const testCase of edgeCases) {
        const tour = {
          name: 'Test Tour',
          url_slug: 'test-tour',
          price: testCase.price,
          currency: 'USD'
        };

        if (testCase.shouldFail) {
          const error = { message: 'Invalid price value' };
          mockSingle.mockReturnValue({ data: null, error });
          await expect(TourService.createTour(tour)).rejects.toThrow();
        }
      }
    });
  });
});
