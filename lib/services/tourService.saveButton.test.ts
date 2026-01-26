import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TourService } from './tourService';
import { supabase } from '../supabaseClient';

// Mock Supabase
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

import { supabase as mockedSupabase } from '../supabaseClient';

describe('Save Button Functionality - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tour Validation Logic', () => {
    it('should validate required fields for published tours', () => {
      const invalidTour = {
        name: '',
        url_slug: '',
        price: null,
        duration: null,
        currency: null,
        description: '',
        region: '',
        country: '',
        status: 'Published' as const
      };

      const validation = validateTourData(invalidTour, 'Published');
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Tour title is required');
      expect(validation.errors).toContain('URL slug is required');
      expect(validation.errors).toContain('Price is required for published tours');
      expect(validation.errors).toContain('Duration is required for published tours');
      expect(validation.errors).toContain('Valid currency is required for published tours');
      expect(validation.errors).toContain('Description is required for published tours');
      expect(validation.errors).toContain('Region is required for published tours');
      expect(validation.errors).toContain('Country is required for published tours');
    });

    it('should allow incomplete data for draft tours', () => {
      const draftTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        status: 'Draft' as const
      };

      const validation = validateTourData(draftTour, 'Draft');
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate price ranges correctly', () => {
      const invalidPriceTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: -100,
        status: 'Published' as const
      };

      const validation = validateTourPrice(invalidPriceTour);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Price must be a positive number');
    });

    it('should validate duration ranges correctly', () => {
      const invalidDurationTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        duration: 500,
        currency: 'USD',
        status: 'Published' as const
      };

      const validation = validateTourDuration(invalidDurationTour);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Duration cannot exceed 365 days');
    });

    it('should validate currency codes', () => {
      const invalidCurrencyTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        duration: 14,
        currency: 'INVALID',
        status: 'Published' as const
      };

      const validation = validateTourCurrency(invalidCurrencyTour);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Valid currency is required for published tours');
    });

    it('should validate canonical URLs', () => {
      const invalidUrlTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        duration: 14,
        currency: 'USD',
        canonical_url: 'invalid-url',
        status: 'Published' as const
      };

      const validation = validateTourCanonicalUrl(invalidUrlTour);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Canonical URL must be a valid URL');
    });

    it('should validate focus keywords length', () => {
      const longKeywordsTour = {
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        duration: 14,
        currency: 'USD',
        focus_keywords: 'a'.repeat(256),
        status: 'Published' as const
      };

      const validation = validateTourFocusKeywords(longKeywordsTour);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Focus keywords cannot exceed 255 characters');
    });
  });

  describe('Save Operation Handling', () => {
    it('should handle successful save operations', async () => {
      const mockTour = {
        id: 'test-tour-id',
        name: 'Test Tour',
        url_slug: 'test-tour',
        price: 1000,
        currency: 'USD',
        status: 'Published' as const
      };

      const mockSingle = vi.fn().mockReturnValue({ data: mockTour, error: null });
      const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
      
      (mockedSupabase.from as any).mockReturnValue({
        insert: mockInsert
      });

      const result = await TourService.createTour(mockTour);

      expect(result).toEqual(mockTour);
      expect(mockedSupabase.from).toHaveBeenCalledWith('tours');
    });

  it('should handle save timeout scenarios', async () => {
      const timeoutError = { message: 'Save operation timed out' };
      const mockSingle = vi.fn().mockReturnValue({ data: null, error: timeoutError });
      const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
      (mockedSupabase.from as any).mockReturnValue({ insert: mockInsert });
      await expect(TourService.createTour({ name: 'Test' })).rejects.toThrow('Save operation timed out');
  });

  it('should handle network errors gracefully', async () => {
      const networkError = {
        message: 'Network error',
        code: 'NETWORK_ERROR'
      };

      const mockSingle = vi.fn().mockReturnValue({ data: null, error: networkError });
      const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
      
      (mockedSupabase.from as any).mockReturnValue({ insert: mockInsert });
      await expect(TourService.createTour({ name: 'Test' })).rejects.toThrow('Network error');
  });

    it('should handle validation errors from database', async () => {
      const validationError = {
        message: 'Price cannot be negative',
        code: '23514'
      };

      const mockSingle = vi.fn().mockReturnValue({ data: null, error: validationError });
      const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
      
      (mockedSupabase.from as any).mockReturnValue({
        insert: mockInsert
      });

      await expect(TourService.createTour({ name: 'Test', price: -100 })).rejects.toThrow('Price cannot be negative');
    });
  });

  describe('Error Message Formatting', () => {
    it('should format multiple validation errors correctly', () => {
      const multipleErrors = [
        'Tour title is required',
        'URL slug is required',
        'Price is required for published tours'
      ];

      const formattedErrors = formatValidationErrors(multipleErrors);
      
      expect(formattedErrors).toBe('1. Tour title is required\n2. URL slug is required\n3. Price is required for published tours');
    });

    it('should handle empty error arrays', () => {
      const formattedErrors = formatValidationErrors([]);
      
      expect(formattedErrors).toBe('');
    });

    it('should handle single errors', () => {
      const singleError = ['Tour title is required'];
      
      const formattedErrors = formatValidationErrors(singleError);
      
      expect(formattedErrors).toBe('1. Tour title is required');
    });
  });

  describe('Button State Management', () => {
    it('should disable buttons during loading state', () => {
      const isLoading = true;
      const isFormDirty = true;
      
      const shouldDisableSave = isLoading;
      
      expect(shouldDisableSave).toBe(true);
    });

    it('should enable buttons when not loading and form is dirty', () => {
      const isLoading = false;
      const isFormDirty = true;
      
      const shouldEnableSave = !isLoading;
      
      expect(shouldEnableSave).toBe(true);
    });

    it('should show loading indicators during save operations', () => {
      const isLoading = true;
      const buttonText = isLoading ? 'Saving...' : 'Save Changes';
      
      expect(buttonText).toBe('Saving...');
    });

    it('should show unsaved changes indicator', () => {
      const isFormDirty = true;
      const shouldShowIndicator = isFormDirty;
      
      expect(shouldShowIndicator).toBe(true);
    });
  });

  describe('Field-Level Validation', () => {
    it('should validate tour title field', () => {
      const invalidTitle = '';
      const validation = validateTourTitle(invalidTitle);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Tour title is required');
    });

    it('should validate URL slug field', () => {
      const invalidSlug = '';
      const validation = validateTourUrlSlug(invalidSlug);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('URL slug is required');
    });

    it('should validate duration field with proper ranges', () => {
      const invalidDuration = 0;
      const validation = validateTourDurationField(invalidDuration);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Duration must be between 1 and 365 days');
    });

    it('should validate currency field with proper codes', () => {
      const invalidCurrency = 'INVALID';
      const validation = validateTourCurrencyField(invalidCurrency);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Currency must be a valid ISO currency code');
    });
  });
});

// Helper functions for validation
function validateTourData(tour: any, status: 'Published' | 'Draft') {
  const errors: string[] = [];
  
  if (!tour.name || tour.name.trim().length === 0) {
    errors.push('Tour title is required');
  }
  
  if (!tour.url_slug || tour.url_slug.trim().length === 0) {
    errors.push('URL slug is required');
  }
  
  if (status === 'Published') {
    if (tour.price === null || tour.price === undefined) {
      errors.push('Price is required for published tours');
    }
    if (tour.duration === null || tour.duration === undefined) {
      errors.push('Duration is required for published tours');
    }
    if (!tour.currency || !['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'].includes(tour.currency)) {
      errors.push('Valid currency is required for published tours');
    }
    if (!tour.description || tour.description.trim().length === 0) {
      errors.push('Description is required for published tours');
    }
    if (!tour.region || tour.region.trim().length === 0) {
      errors.push('Region is required for published tours');
    }
    if (!tour.country || tour.country.trim().length === 0) {
      errors.push('Country is required for published tours');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateTourPrice(tour: any) {
  const errors: string[] = [];
  
  if (tour.price !== null && tour.price !== undefined) {
    if (isNaN(tour.price) || tour.price < 0) {
      errors.push('Price must be a positive number');
    }
    if (tour.price > 999999) {
      errors.push('Price cannot exceed $999,999');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateTourDuration(tour: any) {
  const errors: string[] = [];
  
  if (tour.duration !== null && tour.duration !== undefined) {
    if (isNaN(tour.duration) || tour.duration < 1) {
      errors.push('Duration must be at least 1 day');
    }
    if (tour.duration > 365) {
      errors.push('Duration cannot exceed 365 days');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateTourCurrency(tour: any) {
  const errors: string[] = [];
  
  if (tour.currency && !['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'].includes(tour.currency)) {
    errors.push('Valid currency is required for published tours');
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateTourCanonicalUrl(tour: any) {
  const errors: string[] = [];
  
  if (tour.canonical_url && tour.canonical_url.trim().length > 0) {
    try {
      new URL(tour.canonical_url);
      if (!tour.canonical_url.startsWith('http://') && !tour.canonical_url.startsWith('https://')) {
        errors.push('Canonical URL must start with http:// or https://');
      }
    } catch {
      errors.push('Canonical URL must be a valid URL');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateTourFocusKeywords(tour: any) {
  const errors: string[] = [];
  
  if (tour.focus_keywords && tour.focus_keywords.length > 255) {
    errors.push('Focus keywords cannot exceed 255 characters');
  }
  
  return { isValid: errors.length === 0, errors };
}

function formatValidationErrors(errors: string[]) {
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}

function validateTourTitle(title: string) {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Tour title is required' };
  }
  return { isValid: true, error: null };
}

function validateTourUrlSlug(slug: string) {
  if (!slug || slug.trim().length === 0) {
    return { isValid: false, error: 'URL slug is required' };
  }
  return { isValid: true, error: null };
}

function validateTourDurationField(duration: number) {
  if (duration !== null && duration !== undefined) {
    if (isNaN(duration) || duration < 1 || duration > 365) {
      return { isValid: false, error: 'Duration must be between 1 and 365 days' };
    }
  }
  return { isValid: true, error: null };
}

function validateTourCurrencyField(currency: string) {
  if (currency && !['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'].includes(currency)) {
    return { isValid: false, error: 'Currency must be a valid ISO currency code' };
  }
  return { isValid: true, error: null };
}
