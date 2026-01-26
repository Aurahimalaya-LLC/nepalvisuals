import React, { useState } from 'react';
import { Tour } from '../../lib/services/tourService';

interface TourDetailsPanelProps {
  tour: Tour;
  onEdit: () => void;
  loading?: boolean;
}

export const TourDetailsPanel: React.FC<TourDetailsPanelProps> = ({
  tour,
  onEdit,
  loading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'pricing', 'details']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const Section: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
    <div className="border-b border-admin-border last:border-b-0 pb-4 last:pb-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between text-left py-2 hover:bg-gray-50 rounded px-2 transition-colors"
        aria-expanded={expandedSections.includes(id)}
        aria-controls={`section-${id}`}
      >
        <h3 className="font-semibold text-admin-text-primary">{title}</h3>
        <span className={`material-symbols-outlined transition-transform ${expandedSections.includes(id) ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {expandedSections.includes(id) && (
        <div id={`section-${id}`} className="mt-2 px-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-admin-surface rounded-lg border border-admin-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-admin-text-primary">Tour Details</h2>
          <button
            onClick={onEdit}
            className="text-sm text-admin-primary hover:text-admin-primary-hover font-medium"
          >
            Edit Details
          </button>
        </div>

        {/* Basic Information */}
        <Section title="Basic Information" id="basic">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-admin-text-secondary">Status</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                tour.status === 'Published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {tour.status}
              </span>
            </div>
            
            {tour.category && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Category</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.category}</span>
              </div>
            )}

            {tour.difficulty && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Difficulty</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.difficulty}</span>
              </div>
            )}

            {tour.duration && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Duration</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.duration} days</span>
              </div>
            )}

            {tour.guide_language && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Guide Language</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.guide_language}</span>
              </div>
            )}

            {tour.tour_type && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Tour Type</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.tour_type}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Pricing Information */}
        <Section title="Pricing" id="pricing">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-admin-text-secondary">Base Price</span>
              <span className="text-lg font-bold text-admin-text-primary">{formatPrice(tour.price)}</span>
            </div>

            {tour.seasonal_prices && tour.seasonal_prices.length > 0 && (
              <div className="mt-3 pt-3 border-t border-admin-border">
                <p className="text-sm font-medium text-admin-text-primary mb-2">Seasonal Pricing</p>
                <div className="space-y-2">
                  {tour.seasonal_prices.map((season, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-admin-text-secondary">
                        {season.label || `${season.start_date} - ${season.end_date}`}
                      </span>
                      <span className="font-medium text-admin-text-primary">{formatPrice(season.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tour.group_discounts && tour.group_discounts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-admin-border">
                <p className="text-sm font-medium text-admin-text-primary mb-2">Group Discounts</p>
                <div className="space-y-2">
                  {tour.group_discounts.map((discount, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-admin-text-secondary">
                        {discount.min_guests}-{discount.max_guests} guests
                      </span>
                      <span className="font-medium text-admin-text-primary">{discount.discount_percentage}% off</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Location Information */}
        <Section title="Location" id="location">
          <div className="space-y-3">
            {tour.destination && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Destination</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.destination}</span>
              </div>
            )}

            {tour.region && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Region</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.region}</span>
              </div>
            )}

            {tour.country && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Country</span>
                <span className="text-sm font-medium text-admin-text-primary">{tour.country}</span>
              </div>
            )}
          </div>
        </Section>

        {/* SEO Information */}
        {(tour.meta_title || tour.meta_description) && (
          <Section title="SEO Information" id="seo">
            <div className="space-y-3">
              {tour.meta_title && (
                <div>
                  <span className="text-sm text-admin-text-secondary block mb-1">Meta Title</span>
                  <p className="text-sm font-medium text-admin-text-primary">{tour.meta_title}</p>
                </div>
              )}

              {tour.meta_description && (
                <div>
                  <span className="text-sm text-admin-text-secondary block mb-1">Meta Description</span>
                  <p className="text-sm text-admin-text-primary">{tour.meta_description}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Timestamps */}
        <Section title="Timestamps" id="timestamps">
          <div className="space-y-3">
            {tour.created_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Created</span>
                <span className="text-sm font-medium text-admin-text-primary">{formatDate(tour.created_at)}</span>
              </div>
            )}

            {tour.updated_at && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-admin-text-secondary">Last Updated</span>
                <span className="text-sm font-medium text-admin-text-primary">{formatDate(tour.updated_at)}</span>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default TourDetailsPanel;