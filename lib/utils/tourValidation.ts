import { Tour } from '../services/tourService';

export type TourValidationResult = {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
};

const requiredForDisplay: Array<keyof Tour> = [
  'name',
  'url_slug',
  'status',
  'price',
];

export const validateTourForDisplay = (tour: Tour | null): TourValidationResult => {
  const result: TourValidationResult = {
    isValid: true,
    missingFields: [],
    warnings: [],
  };

  if (!tour) {
    result.isValid = false;
    result.missingFields.push('tour');
    return result;
  }

  for (const field of requiredForDisplay) {
    const value = tour[field];
    const isMissing =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim().length === 0);
    if (isMissing) {
      result.missingFields.push(field as string);
    }
  }

  if (tour.status === 'Published') {
    if (!tour.description || tour.description.trim().length === 0) {
      result.warnings.push('Published tours should include a description');
    }
    if (!tour.region || tour.region.trim().length === 0) {
      result.warnings.push('Published tours should include a region');
    }
    if (!tour.country || tour.country.trim().length === 0) {
      result.warnings.push('Published tours should include a country');
    }
  }

  if (!Array.isArray(tour.itineraries)) {
    result.warnings.push('Itineraries should be an array');
  }
  if (!Array.isArray(tour.tour_highlights)) {
    result.warnings.push('Highlights should be an array');
  }
  if (!Array.isArray(tour.seasonal_prices)) {
    result.warnings.push('Seasonal prices should be an array');
  }
  if (!Array.isArray(tour.group_discounts)) {
    result.warnings.push('Group discounts should be an array');
  }

  if (result.missingFields.length > 0) {
    result.isValid = false;
  }

  return result;
};

