import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tour, TourService } from '../lib/services/tourService';
import { useTourData } from '../lib/hooks/useTourData';
import useTourView from '../lib/hooks/useTourView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import TourViewHeader from '../components/tour/TourViewHeader';
import TourDetailsPanel from '../components/tour/TourDetailsPanel';
import TourImageGallery from '../components/tour/TourImageGallery';
import TourItineraryTimeline from '../components/tour/TourItineraryTimeline';
import TourPricingCard from '../components/tour/TourPricingCard';
import TourHighlightsSection from '../components/tour/TourHighlightsSection';
import TourReviewsSection from '../components/tour/TourReviewsSection';
import { mapTourLoadError } from '../lib/utils/errorUtils';
import { validateTourForDisplay } from '../lib/utils/tourValidation';
import { sanitizeHtml } from '../lib/utils/htmlUtils';

const AdminTourViewPage: React.FC = () => {
  const { trekId } = useParams<{ trekId: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Data fetching with real-time updates
  const {
    tour,
    loading,
    error,
    refetch,
    updateTour,
    deleteTour
  } = useTourData({
    id: trekId || '',
    refetchInterval: 30000, // Refetch every 30 seconds
    onError: (err) => {
      console.error('Failed to fetch tour:', err);
    },
    onSuccess: (data) => {
      console.log('Tour data loaded successfully:', data.id);
    }
  });

  // View state management
  const [viewState, viewActions] = useTourView(tour);

  // Mock reviews data - in a real app, this would come from a reviews API
  const mockReviews = [
    {
      id: '1',
      customer_name: 'Sarah Johnson',
      rating: 5,
      title: 'Amazing Experience!',
      content: 'This trek was absolutely incredible. The guides were knowledgeable and the views were breathtaking. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      helpful: 12
    },
    {
      id: '2',
      customer_name: 'Mike Chen',
      rating: 4,
      title: 'Great Adventure',
      content: 'Challenging but rewarding trek. The organization was excellent and the accommodations were comfortable.',
      date: '2024-01-10',
      verified: true,
      helpful: 8
    },
    {
      id: '3',
      customer_name: 'Emma Wilson',
      rating: 5,
      title: 'Unforgettable Journey',
      content: 'The Everest Base Camp trek exceeded all expectations. Professional team and perfect logistics.',
      date: '2024-01-05',
      verified: false,
      helpful: 15
    }
  ];

  // Mock highlights data
  const mockHighlights = [
    { 
      icon: 'explore', 
      title: 'Everest Base Camp Arrival',
      text: 'Stand at the foot of the world\'s highest peak and witness the massive Khumbu Icefall close up.', 
      category: 'experience' as const,
      location: 'Base Camp (5,364m)',
      time: 'Day 8, Afternoon',
      isSpecial: true
    },
    { 
      icon: 'explore', 
      title: 'Kala Patthar Sunrise',
      text: 'Early morning hike for the most iconic panoramic views of Everest, Nuptse, and Lhotse.', 
      category: 'experience' as const,
      location: 'Kala Patthar (5,545m)',
      time: 'Day 9, 04:30 AM',
      isSpecial: true
    },
    { 
      icon: 'hotel', 
      title: 'Hotel Everest View',
      text: 'Acclimatization stop at one of the highest placed hotels in the world with direct Everest views.', 
      category: 'accommodation' as const,
      location: 'Syangboche',
      time: 'Day 3',
      isSpecial: false
    },
    { 
      icon: 'person', 
      title: 'Sherpa Culture & History',
      text: 'Visit the Sherpa Culture Museum and interact with the local community in Namche Bazaar.', 
      category: 'experience' as const,
      location: 'Namche Bazaar',
      time: 'Day 2',
      isSpecial: false
    },
    { 
      icon: 'restaurant', 
      title: 'Traditional Sherpa Cuisine',
      text: 'Enjoy authentic hearty Sherpa stew (Syakpa) and Dal Bhat to stay warm and energized.', 
      category: 'meals' as const,
      location: 'Tea Houses',
      isSpecial: false
    },
    { 
      icon: 'directions_car', 
      title: 'Lukla Scenic Flight',
      text: 'Experience the thrilling flight to Tenzing-Hillary Airport, the gateway to the Everest region.', 
      category: 'transport' as const,
      location: 'Kathmandu - Lukla',
      time: 'Day 1 & Day 12',
      isSpecial: true
    }
  ];

  // Handle tour actions
  const handleEdit = () => {
    if (tour) {
      navigate(`/admin/trek/edit/${tour.id}`);
    }
  };

  const handleDelete = async () => {
    if (!tour) return;
    
    try {
      await deleteTour();
      navigate('/admin/tours');
    } catch (error) {
      console.error('Failed to delete tour:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!tour) return;
    
    try {
      // Create a copy of the tour with a new name
      const duplicatedTour = {
        ...tour,
        name: `${tour.name} (Copy)`,
        url_slug: `${tour.url_slug}-copy-${Date.now()}`,
        status: 'Draft' as const,
        created_at: undefined,
        updated_at: undefined,
        id: undefined
      };

      const newTour = await TourService.createTour(duplicatedTour);
      navigate(`/admin/trek/edit/${newTour.id}`);
    } catch (error) {
      console.error('Failed to duplicate tour:', error);
    }
  };

  const handlePriceUpdate = async (price: number) => {
    if (!tour) return;
    
    try {
      await updateTour({ price });
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-admin-background">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner 
            text="Loading tour details..." 
            fullScreen={false}
            className="h-64"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const friendly = mapTourLoadError(error);
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-admin-background">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-600">error</span>
              <h2 className="text-lg font-semibold text-red-800">{friendly.title}</h2>
            </div>
            <p className="text-red-700 mb-2">{friendly.message}</p>
            {friendly.suggestion && (
              <p className="text-red-700 mb-4">{friendly.suggestion}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/admin/tours')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Tours
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No tour found
  if (!tour) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-admin-background">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-yellow-600">warning</span>
              <h2 className="text-lg font-semibold text-yellow-800">Tour Not Found</h2>
            </div>
            <p className="text-yellow-700 mb-4">
              The tour you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => navigate('/admin/tours')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Back to Tours
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validation = validateTourForDisplay(tour);

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'details', label: 'Details', icon: 'info' },
    { id: 'itinerary', label: 'Itinerary', icon: 'map' },
    { id: 'pricing', label: 'Pricing', icon: 'attach_money' },
    { id: 'reviews', label: 'Reviews', icon: 'reviews' },
    { id: 'gallery', label: 'Gallery', icon: 'photo_library' }
  ];

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-admin-background">
        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-600">info</span>
                <div>
                  {!validation.isValid && (
                    <>
                      <p className="text-yellow-800 font-semibold mb-1">Some required fields are missing for display.</p>
                      <p className="text-yellow-700 text-sm mb-2">
                        Missing: {validation.missingFields.join(', ')}
                      </p>
                    </>
                  )}
                  {validation.warnings.length > 0 && (
                    <ul className="text-yellow-700 text-sm list-disc ml-4">
                      {validation.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modals */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Tour</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{tour.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Tour
                </button>
              </div>
            </div>
          </div>
        )}

        {showDuplicateModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Duplicate Tour</h3>
              <p className="text-gray-600 mb-6">
                Create a copy of "{tour.name}"? The new tour will be saved as a draft.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDuplicate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <TourViewHeader
            tour={tour}
            onEdit={handleEdit}
            onDelete={() => setShowDeleteConfirm(true)}
            onDuplicate={() => setShowDuplicateModal(true)}
          />

          {/* Navigation Tabs */}
          <div className="mb-8 border-b border-admin-border">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeSection === tab.id
                      ? 'border-admin-primary text-admin-primary'
                      : 'border-transparent text-admin-text-secondary hover:text-admin-text-primary hover:border-admin-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Based on Active Tab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {activeSection === 'overview' && (
                <>
                  {/* Image Gallery */}
                  <TourImageGallery tour={tour} />

                  {/* Description */}
                  {tour.description && (
                    <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                      <h2 className="text-xl font-semibold text-admin-text-primary mb-4">Tour Description</h2>
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="text-admin-text-secondary leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  <TourHighlightsSection highlights={mockHighlights} />
                </>
              )}

              {activeSection === 'details' && (
                <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                  <h2 className="text-xl font-semibold text-admin-text-primary mb-6">Tour Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-admin-text-primary mb-3">Basic Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-admin-text-secondary">Status</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tour.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tour.status}
                          </span>
                        </div>
                        {tour.category && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Category</span>
                            <span className="text-admin-text-primary">{tour.category}</span>
                          </div>
                        )}
                        {tour.difficulty && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Difficulty</span>
                            <span className="text-admin-text-primary">{tour.difficulty}</span>
                          </div>
                        )}
                        {tour.duration && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Duration</span>
                            <span className="text-admin-text-primary">{tour.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-admin-text-primary mb-3">Location</h3>
                      <div className="space-y-2">
                        {tour.destination && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Destination</span>
                            <span className="text-admin-text-primary">{tour.destination}</span>
                          </div>
                        )}
                        {tour.region && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Region</span>
                            <span className="text-admin-text-primary">{tour.region}</span>
                          </div>
                        )}
                        {tour.country && (
                          <div className="flex justify-between">
                            <span className="text-admin-text-secondary">Country</span>
                            <span className="text-admin-text-primary">{tour.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'itinerary' && tour.itineraries && tour.itineraries.length > 0 && (
                <TourItineraryTimeline itineraries={tour.itineraries} />
              )}

              {activeSection === 'pricing' && (
                <TourPricingCard tour={tour} onPriceUpdate={handlePriceUpdate} />
              )}

              {activeSection === 'reviews' && (
                <TourReviewsSection 
                  tourId={tour.id} 
                  reviews={mockReviews}
                />
              )}

              {activeSection === 'gallery' && (
                <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                  <h2 className="text-xl font-semibold text-admin-text-primary mb-4">Photo Gallery</h2>
                  <TourImageGallery tour={tour} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <h3 className="font-semibold text-admin-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Edit Tour
                  </button>
                  <button
                    onClick={() => setShowDuplicateModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/trip/${tour.url_slug}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">share</span>
                    Share Link
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete Tour
                  </button>
                </div>
              </div>

              {/* Tour Stats */}
              <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                <h3 className="font-semibold text-admin-text-primary mb-4">Tour Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-admin-text-secondary">Status</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tour.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tour.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-text-secondary">Created</span>
                    <span className="text-sm text-admin-text-primary">
                      {new Date(tour.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {tour.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-admin-text-secondary">Last Updated</span>
                      <span className="text-sm text-admin-text-primary">
                        {new Date(tour.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Quick View */}
              {activeSection !== 'pricing' && (
                <div className="bg-admin-surface rounded-lg border border-admin-border p-6">
                  <h3 className="font-semibold text-admin-text-primary mb-4">Pricing</h3>
                  <div className="text-2xl font-bold text-admin-text-primary mb-2">
                    ${tour.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-admin-text-secondary mb-4">Base price per person</p>
                  <button
                    onClick={() => setActiveSection('pricing')}
                    className="w-full px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
                  >
                    View Pricing Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminTourViewPage;
