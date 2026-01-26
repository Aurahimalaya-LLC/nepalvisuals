import React, { useState, useEffect, useRef } from 'react';
import { MediaService } from '../../lib/services/mediaService';

interface MediaImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  size?: number;
  uploadDate?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Single selection support
  onImageSelect?: (imageUrl: string, altText?: string) => void;
  // Multi-selection support
  multiple?: boolean;
  onImagesSelect?: (images: { url: string; alt: string }[]) => void;
  maxSelection?: number;
  
  currentImage?: string; // For single selection
  initialSelectedImages?: string[]; // For multi selection
  title?: string;
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  multiple = false,
  onImagesSelect,
  maxSelection,
  currentImage,
  initialSelectedImages = [],
  title = "Select Image"
}) => {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // We use a Set for O(1) lookups, storing image URLs as keys
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gallery'>('grid');
  const [lastSelectedUrl, setLastSelectedUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);



  const loadImages = async (reset = false) => {
    if (loading || (!reset && !hasMore && images.length > 0)) return;

    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 1 : page;
      const { data, count } = await MediaService.getMedia(currentPage, 20);
      
      const mappedImages: MediaImage[] = data.map(file => ({
          id: file.id,
          url: file.public_url || '',
          alt: file.alt_text || file.filename,
          title: file.title || file.filename,
          width: file.width || undefined,
          height: file.height || undefined,
          size: file.size_bytes || undefined,
          uploadDate: file.created_at
      }));

      setImages(prev => reset ? mappedImages : [...prev, ...mappedImages]);
      setTotalCount(count);
      setHasMore(mappedImages.length === 20);
      setPage(prev => reset ? 2 : prev + 1);

    } catch (err) {
      setError('Failed to load image library. Please try again.');
      console.error('Error loading media library:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced scroll handler
  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
        if (scrollContainerRef.current) {
            const position = viewMode === 'gallery' ? scrollContainerRef.current.scrollLeft : scrollContainerRef.current.scrollTop;
            sessionStorage.setItem(`media-library-scroll-${viewMode}`, position.toString());
        }
    }, 150);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadImages(false);
        }
      },
      { threshold: 0.5, root: scrollContainerRef.current }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadImages]);

  // Restore scroll position when modal opens or view mode changes
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const savedPosition = sessionStorage.getItem(`media-library-scroll-${viewMode}`);
      if (savedPosition) {
        // Use requestAnimationFrame to ensure content is rendered
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            if (viewMode === 'gallery') {
                scrollContainerRef.current.scrollLeft = parseInt(savedPosition, 10);
            } else {
                scrollContainerRef.current.scrollTop = parseInt(savedPosition, 10);
            }
          }
        });
      }
    }
  }, [isOpen, viewMode, images.length]);

  // Cleanup object URLs on unmount or when images change
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  useEffect(() => {
    if (isOpen) {
      // Reset and load
      setPage(1);
      setImages([]);
      setHasMore(true);
      loadImages(true);
      
      // Initialize selection state
      if (multiple) {
        setSelectedUrls(new Set(initialSelectedImages));
      } else if (currentImage) {
        setSelectedUrls(new Set([currentImage]));
      } else {
        setSelectedUrls(new Set());
      }
    }
  }, [isOpen]); // Removed dependencies that shouldn't trigger reload

  const filteredImages = images.filter(image =>
    image.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.title || a.alt).localeCompare(b.title || b.alt);
      case 'date':
        return new Date(b.uploadDate || '').getTime() - new Date(a.uploadDate || '').getTime();
      case 'size':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });

  const handleImageClick = (image: MediaImage, e?: React.MouseEvent) => {
    if (multiple) {
      const newSelection = new Set(selectedUrls);
      
      // Range selection
      if (e?.shiftKey && lastSelectedUrl) {
        const lastIndex = sortedImages.findIndex(img => img.url === lastSelectedUrl);
        const currentIndex = sortedImages.findIndex(img => img.url === image.url);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          const range = sortedImages.slice(start, end + 1);
          
          range.forEach(img => {
            if (!maxSelection || newSelection.size < maxSelection) {
              newSelection.add(img.url);
            }
          });
          setSelectedUrls(newSelection);
          setLastSelectedUrl(image.url);
          return;
        }
      }

      if (newSelection.has(image.url)) {
        newSelection.delete(image.url);
        setLastSelectedUrl(null);
      } else {
        if (maxSelection && newSelection.size >= maxSelection) {
          alert(`You can only select up to ${maxSelection} images.`);
          return;
        }
        newSelection.add(image.url);
        setLastSelectedUrl(image.url);
      }
      setSelectedUrls(newSelection);
    } else {
      // Single selection mode
      setSelectedUrls(new Set([image.url]));
    }
  };

  const handleSelectAll = () => {
    if (!multiple) return;
    
    if (selectedUrls.size === sortedImages.length) {
      setSelectedUrls(new Set());
    } else {
      const newSelection = new Set<string>();
      sortedImages.forEach(img => {
        if (!maxSelection || newSelection.size < maxSelection) {
          newSelection.add(img.url);
        }
      });
      setSelectedUrls(newSelection);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
        if (onImagesSelect) {
            const selectedItems = images
                .filter(img => selectedUrls.has(img.url))
                .map(img => ({ url: img.url, alt: img.alt }));
            onImagesSelect(selectedItems);
        }
    } else {
        if (onImageSelect) {
            // Find the single selected image
            const url = Array.from(selectedUrls)[0];
            if (url) {
                const img = images.find(i => i.url === url);
                onImageSelect(url, img?.alt);
            }
        }
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process files
    const newImages: MediaImage[] = [];
    const newSelectedUrls = new Set(selectedUrls);

    Array.from(files).forEach((file: File, index) => {
        // In a real app, upload to server here.
        // For now, create object URL.
        const url = URL.createObjectURL(file);
        const newImage: MediaImage = {
            id: `upload-${Date.now()}-${index}`,
            url: url,
            alt: file.name,
            title: file.name,
            width: 0, // Would need to load image to get dims
            height: 0,
            size: file.size,
            uploadDate: new Date().toISOString()
        };
        newImages.push(newImage);
        
        // Auto-select uploaded images if space permits
        if (multiple) {
             if (!maxSelection || newSelectedUrls.size < maxSelection) {
                 newSelectedUrls.add(url);
             }
        } else {
            // For single select, select the last uploaded one
            if (index === files.length - 1) {
                newSelectedUrls.clear();
                newSelectedUrls.add(url);
            }
        }
    });

    setImages(prev => [...newImages, ...prev]); // Add new images to top
    setSelectedUrls(newSelectedUrls);
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };



  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const selectionCount = selectedUrls.size;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCancel}></div>
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>{sortedImages.length} items</span>
                    {multiple && maxSelection && (
                        <span>• Selected {selectionCount} / {maxSelection}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {multiple && (
                  <label className="flex items-center gap-2 cursor-pointer mr-2">
                    <input 
                      type="checkbox" 
                      checked={sortedImages.length > 0 && selectedUrls.size === sortedImages.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                    />
                    <span className="text-sm text-gray-600">Select All</span>
                  </label>
                )}
                
                <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-admin-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Grid View"
                  >
                    <span className="material-symbols-outlined text-xl">grid_view</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-admin-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    title="List View"
                  >
                    <span className="material-symbols-outlined text-xl">view_list</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('gallery')}
                    className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white shadow-sm text-admin-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    title="Gallery View"
                  >
                    <span className="material-symbols-outlined text-xl">view_carousel</span>
                  </button>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button
                    onClick={handleUploadClick}
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                    <span className="material-symbols-outlined">upload</span>
                    <span className="hidden sm:inline">Upload Images</span>
                </button>
                <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-500 transition-colors ml-2"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading && images.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading image library...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={loadImages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`p-6 h-full scroll-smooth focus:outline-none focus:ring-2 focus:ring-inset focus:ring-admin-primary/20 
                    [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 
                    [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full 
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 
                    touch-pan-y
                    ${viewMode === 'gallery' 
                        ? 'overflow-x-auto overflow-y-hidden whitespace-nowrap flex items-center snap-x snap-mandatory touch-pan-x' 
                        : 'overflow-y-auto'}`}
                tabIndex={0}
                role="region"
                aria-label="Media Library Content"
              >
                {sortedImages.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <span className="material-symbols-outlined text-gray-400 text-4xl mb-4">image</span>
                    <p className="text-gray-600">No images found</p>
                    <button
                        onClick={handleUploadClick}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">upload</span>
                        Upload Image
                    </button>
                  </div>
                ) : (
                  <>
                  {viewMode === 'list' ? (
                  <div className="space-y-2">
                    {sortedImages.map((image) => {
                      const isSelected = selectedUrls.has(image.url);
                      return (
                        <div
                          key={image.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-admin-primary bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={(e) => handleImageClick(image, e)}
                        >
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={image.url} alt={image.alt} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{image.title || image.alt}</h3>
                            <p className="text-sm text-gray-500 truncate">{image.alt}</p>
                          </div>
                          <div className="text-sm text-gray-500 w-24 text-right">
                            {image.size ? formatFileSize(image.size) : '-'}
                          </div>
                          <div className="text-sm text-gray-500 w-32 text-right">
                            {image.uploadDate ? new Date(image.uploadDate).toLocaleDateString() : '-'}
                          </div>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-admin-primary border-admin-primary text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : viewMode === 'gallery' ? (
                  <div className="flex gap-4 px-4 min-w-max">
                    {sortedImages.map((image) => {
                      const isSelected = selectedUrls.has(image.url);
                      return (
                        <div
                            key={image.id}
                            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 w-64 h-64 snap-center ${
                            isSelected
                                ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={(e) => handleImageClick(image, e)}
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            
                            {/* Overlay with image info */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                            <div className="p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 w-full whitespace-normal">
                                <p className="text-sm font-medium truncate">{image.title || image.alt}</p>
                                <p className="text-xs opacity-75">{formatFileSize(image.size || 0)}</p>
                            </div>
                            </div>

                            {/* Selection indicator */}
                            <div className={`absolute top-2 right-2 rounded-full p-1 transition-all ${
                                isSelected 
                                    ? 'bg-blue-500 text-white scale-100' 
                                    : 'bg-black/30 text-white scale-0 group-hover:scale-100'
                            }`}>
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {sortedImages.map((image) => {
                      const isSelected = selectedUrls.has(image.url);
                      return (
                        <div
                            key={image.id}
                            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                                ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={(e) => handleImageClick(image, e)}
                        >
                            <div className="aspect-square">
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            </div>
                            
                            {/* Overlay with image info */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-end">
                            <div className="p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 w-full">
                                <p className="text-sm font-medium truncate">{image.title || image.alt}</p>
                                <p className="text-xs opacity-75">{formatFileSize(image.size || 0)}</p>
                            </div>
                            </div>

                            {/* Selection indicator */}
                            <div className={`absolute top-2 right-2 rounded-full p-1 transition-all ${
                                isSelected 
                                    ? 'bg-blue-500 text-white scale-100' 
                                    : 'bg-black/30 text-white scale-0 group-hover:scale-100'
                            }`}>
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {hasMore && !loading && (
                  <div ref={loadMoreRef} className="mt-6 flex justify-center h-10 w-full">
                    {/* Sentinel for infinite scroll */}
                  </div>
                )}

                {loading && (
                  <div className="mt-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </>
              )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectionCount > 0 ? (
                <span className="flex items-center gap-2 text-blue-700 font-medium">
                  <span className="material-symbols-outlined">check_circle</span>
                  {selectionCount} image{selectionCount !== 1 ? 's' : ''} selected
                </span>
              ) : (
                'Select images to continue'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectionCount === 0}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  selectionCount > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{multiple ? `Select ${selectionCount} Images` : 'Select Image'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
