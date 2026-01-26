import React, { useState } from 'react';
import { ItineraryItem } from '../../lib/services/tourService';

interface TourItineraryTimelineProps {
  itineraries: ItineraryItem[];
  loading?: boolean;
}

export const TourItineraryTimeline: React.FC<TourItineraryTimelineProps> = ({
  itineraries,
  loading = false
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [filterMeal, setFilterMeal] = useState<string>('');
  const [filterAccommodation, setFilterAccommodation] = useState<string>('');

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  const filteredItineraries = itineraries.filter(item => {
    if (filterMeal && !item.meals?.toLowerCase().includes(filterMeal.toLowerCase())) return false;
    if (filterAccommodation && !item.accommodation?.toLowerCase().includes(filterAccommodation.toLowerCase())) return false;
    return true;
  });

  const mealIcons = {
    'breakfast': '🍳',
    'lunch': '🥪',
    'dinner': '🍽️',
    'all': '🍽️'
  };

  const getMealIcon = (meals: string | null) => {
    if (!meals) return null;
    const mealLower = meals.toLowerCase();
    if (mealLower.includes('breakfast')) return mealIcons.breakfast;
    if (mealLower.includes('lunch')) return mealIcons.lunch;
    if (mealLower.includes('dinner')) return mealIcons.dinner;
    return mealIcons.all;
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Itinerary</h3>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-admin-text-secondary mb-2">map</span>
          <p className="text-admin-text-secondary">No itinerary available for this tour.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-admin-surface rounded-lg border border-admin-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-admin-text-primary">Itinerary</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter by meal..."
              value={filterMeal}
              onChange={(e) => setFilterMeal(e.target.value)}
              className="px-3 py-1 text-sm border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by accommodation..."
              value={filterAccommodation}
              onChange={(e) => setFilterAccommodation(e.target.value)}
              className="px-3 py-1 text-sm border border-admin-border rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-admin-border"></div>

          {filteredItineraries.map((item, index) => (
            <div key={item.id} className="relative mb-8 last:mb-0">
              {/* Timeline dot */}
              <div className="absolute left-4 w-2 h-2 bg-admin-primary rounded-full transform -translate-x-1/2"></div>

              <div className="ml-10">
                {/* Day header */}
                <button
                  onClick={() => toggleDay(item.day_number)}
                  className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-lg p-3 transition-colors"
                  aria-expanded={expandedDay === item.day_number}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-admin-primary text-white rounded-full text-sm font-semibold">
                      {item.day_number}
                    </span>
                    <div>
                      <h4 className="font-semibold text-admin-text-primary">{item.title}</h4>
                      {(item.meals || item.accommodation) && (
                        <div className="flex items-center gap-2 text-sm text-admin-text-secondary">
                          {item.meals && (
                            <span className="flex items-center gap-1">
                              {getMealIcon(item.meals)} {item.meals}
                            </span>
                          )}
                          {item.accommodation && (
                            <span>• {item.accommodation}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${
                    expandedDay === item.day_number ? 'rotate-180' : ''
                  }`}>
                    expand_more
                  </span>
                </button>

                {/* Expanded content */}
                {expandedDay === item.day_number && (
                  <div className="mt-4 ml-11 space-y-4 animate-fade-in">
                    {item.description && (
                      <div>
                        <h5 className="font-medium text-admin-text-primary mb-2">Description</h5>
                        <p className="text-admin-text-secondary leading-relaxed">{item.description}</p>
                      </div>
                    )}

                    {item.accommodation && (
                      <div>
                        <h5 className="font-medium text-admin-text-primary mb-2">Accommodation</h5>
                        <p className="text-admin-text-secondary">{item.accommodation}</p>
                      </div>
                    )}

                    {item.meals && (
                      <div>
                        <h5 className="font-medium text-admin-text-primary mb-2">Meals Included</h5>
                        <p className="text-admin-text-secondary">{item.meals}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-admin-border">
          <div className="flex items-center justify-between text-sm text-admin-text-secondary">
            <span>Total Days: {itineraries.length}</span>
            <span>Filtered: {filteredItineraries.length} days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourItineraryTimeline;