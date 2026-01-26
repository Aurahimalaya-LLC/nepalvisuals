import React, { useState, useCallback } from 'react';
import { Tour } from '../../lib/services/tourService';

interface TourImageGalleryProps {
  tour: Tour;
  loading?: boolean;
}

export const TourImageGallery: React.FC<TourImageGalleryProps> = ({
  tour,
  loading = false
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const placeholderFull = 'https://placehold.co/1200x800?text=Image+Unavailable';
  const galleryImages = [tour.featured_image || placeholderFull];

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }, [galleryImages.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  }, [galleryImages.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (e.key) {
      case 'Escape':
        handleLightboxClose();
        break;
      case 'ArrowLeft':
        handlePrevImage();
        break;
      case 'ArrowRight':
        handleNextImage();
        break;
    }
  }, [isLightboxOpen, handleLightboxClose, handlePrevImage, handleNextImage]);

  React.useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, handleKeyDown]);

  if (loading) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour.featured_image && galleryImages.length === 0) {
    return (
      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
        <div className="h-64 bg-admin-background flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-admin-text-secondary mb-4">image</span>
            <p className="text-admin-text-secondary">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
        {/* Main Image */}
        <div className="relative h-64 bg-admin-background cursor-pointer group" onClick={() => handleImageClick(0)}>
          <img
            src={galleryImages[selectedImageIndex]}
            alt={tour.name}
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/1200x800?text=Image+Unavailable';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              zoom_in
            </span>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {galleryImages.length > 1 && (
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-admin-primary ring-2 ring-admin-primary/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${tour.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/160x160?text=No+Image';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="px-4 pb-4">
            <p className="text-sm text-admin-text-secondary text-center">
              {selectedImageIndex + 1} of {galleryImages.length}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={handleLightboxClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              aria-label="Close lightbox"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  aria-label="Next image"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={galleryImages[selectedImageIndex]}
                alt={`${tour.name} - Full size ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/1200x800?text=Image+Unavailable';
                }}
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
              <p className="text-sm text-center">
                {selectedImageIndex + 1} of {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourImageGallery;
