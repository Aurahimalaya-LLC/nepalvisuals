import React, { useState, useRef } from 'react';
import MediaLibraryModal from './MediaLibraryModal';
import { MediaService } from '../../lib/services/mediaService';

interface FeaturedImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  recommendedDimensions?: { width: number; height: number };
}

/**
 * Enhanced Featured Image Upload Component
 * 
 * Provides both direct upload and media library selection options.
 * Handles image validation, preview functionality, and error handling.
 */
export const FeaturedImageUpload: React.FC<FeaturedImageUploadProps> = ({
  value,
  onChange,
  altText = '',
  onAltTextChange,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  recommendedDimensions = { width: 1200, height: 800 }
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check format
      if (!acceptedFormats.includes(file.type)) {
        setError(`Invalid format. Please use: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
        resolve(false);
        return;
      }

      // Check size
      if (file.size > maxSizeBytes) {
        setError(`File too large. Maximum size: ${maxSizeMB}MB`);
        resolve(false);
        return;
      }

      // Check dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        URL.revokeObjectURL(objectUrl); // Cleanup
        
        // Allow images that are close to recommended dimensions (within 20%)
        const widthRatio = Math.abs(width - recommendedDimensions.width) / recommendedDimensions.width;
        const heightRatio = Math.abs(height - recommendedDimensions.height) / recommendedDimensions.height;
        
        if (widthRatio > 0.2 || heightRatio > 0.2) {
          setError(`Recommended dimensions: ${recommendedDimensions.width}x${recommendedDimensions.height}px (within 20%)`);
          resolve(false);
          return;
        }
        
        setError(null);
        resolve(true);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl); // Cleanup
        setError('Failed to load image for validation');
        resolve(false);
      };
      
      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const isValid = await validateImage(file);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      const uploaded = await MediaService.uploadFile(file);
      if (!uploaded.public_url) {
        throw new Error('Upload succeeded but no public URL was returned');
      }
      onChange(uploaded.public_url);
      setIsUploading(false);
    } catch (err) {
      const message = (err as any)?.message || 'An error occurred during upload';
      setError(message);
      setIsUploading(false);
    }
  };

  const handleMediaLibrarySelect = (imageUrl: string, selectedAltText?: string) => {
    onChange(imageUrl);
    if (onAltTextChange && selectedAltText) {
      onAltTextChange(selectedAltText);
    }
    setError(null);
  };

  const handleRemove = () => {
    onChange(null);
    if (onAltTextChange) {
      onAltTextChange('');
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const openMediaLibrary = () => {
    setIsMediaLibraryOpen(true);
  };

  const closeMediaLibrary = () => {
    setIsMediaLibraryOpen(false);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      {/* Image Preview Section */}
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={altText || "Featured preview"}
              className="w-24 h-24 object-cover rounded-lg border border-admin-border"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              aria-label="Remove image"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 bg-admin-background border-2 border-dashed border-admin-border rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-admin-text-secondary text-2xl">image</span>
          </div>
        )}
        
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openMediaLibrary}
              className="px-4 py-2 bg-admin-primary text-white rounded-lg text-sm font-semibold hover:bg-admin-primary-hover transition-colors"
            >
              Choose from Library
            </button>
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isUploading}
              className="px-4 py-2 border border-admin-border text-admin-text-primary rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload New'}
            </button>
          </div>
          
          <div className="text-xs text-admin-text-secondary">
            <p>Recommended: {recommendedDimensions.width}x{recommendedDimensions.height}px</p>
            <p>Formats: JPG, PNG • Max size: {maxSizeMB}MB</p>
          </div>
        </div>
      </div>
      
      {/* Alt Text Input */}
      {value && onAltTextChange && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-admin-text-secondary">
            Alt Text (Accessibility)
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Describe this image for accessibility..."
            className="w-full px-3 py-2 border border-admin-border rounded-lg text-sm focus:ring-2 focus:ring-admin-primary focus:border-transparent"
          />
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={closeMediaLibrary}
        onImageSelect={handleMediaLibrarySelect}
        currentImage={value || undefined}
        title="Select Featured Image"
      />
    </div>
  );
};

export default FeaturedImageUpload;
