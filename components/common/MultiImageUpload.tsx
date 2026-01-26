import React, { useState, useRef, useCallback, useEffect } from 'react';
import MediaLibraryModal from './MediaLibraryModal';

interface MultiImageUploadProps {
    images: (File | string)[];
    onChange: (images: (File | string)[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    onUpload?: (files: File[]) => Promise<string[]>;
    uploading?: boolean;
}

interface ImagePreview {
    id: string;
    url: string;
    file?: File;
    name: string;
    size?: number;
    type?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
    images,
    onChange,
    maxImages = 10,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onUpload,
    uploading = false
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previews, setPreviews] = useState<ImagePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleLibrarySelection = (selectedItems: { url: string; alt: string }[]) => {
        const newImages = [...images];
        let addedCount = 0;

        selectedItems.forEach(item => {
            if (newImages.length < maxImages) {
                newImages.push(item.url);
                addedCount++;
            }
        });
        
        onChange(newImages);
        
        if (addedCount < selectedItems.length) {
            setError(`Limit reached. Only ${addedCount} images were added.`);
        } else {
            setError(null);
        }
    };

    // Convert props images to previews
    useEffect(() => {
        const newPreviews: ImagePreview[] = images.map((img, index) => {
            if (img instanceof File) {
                return {
                    id: `file-${index}-${img.name}`,
                    url: URL.createObjectURL(img),
                    file: img,
                    name: img.name,
                    size: img.size,
                    type: img.type
                };
            } else {
                return {
                    id: `url-${index}-${img}`,
                    url: img,
                    name: img.split('/').pop() || 'Image',
                };
            }
        });
        setPreviews(newPreviews);

        // Cleanup object URLs
        return () => {
            newPreviews.forEach(p => {
                if (p.file) URL.revokeObjectURL(p.url);
            });
        };
    }, [images]);

    const validateFile = (file: File): string | null => {
        if (!acceptedFormats.includes(file.type)) {
            return `Invalid format: ${file.name}. Allowed: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File too large: ${file.name}. Max size: ${maxSizeMB}MB`;
        }
        return null;
    };

    const handleFiles = async (files: File[]) => {
        setError(null);
        
        const validFiles: File[] = [];
        const errors: string[] = [];

        if (images.length + files.length > maxImages) {
            setError(`Cannot select more than ${maxImages} images. You currently have ${images.length} and tried to add ${files.length}.`);
            return;
        }

        files.forEach(file => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors[0]); // Show first error
            return;
        }

        if (validFiles.length > 0) {
            if (onUpload) {
                setIsUploading(true);
                try {
                    const uploadedUrls = await onUpload(validFiles);
                    onChange([...images, ...uploadedUrls]);
                } catch (err: any) {
                    const message = err?.message || 'Failed to upload images';
                    setError(message);
                } finally {
                    setIsUploading(false);
                }
            } else {
                onChange([...images, ...validFiles]);
            }
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            void handleFiles(Array.from(e.dataTransfer.files));
        }
    }, [images, maxImages, onUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            void handleFiles(Array.from(e.target.files));
        }
    };

    const handleRemove = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive 
                        ? 'border-admin-primary bg-admin-primary/5' 
                        : 'border-admin-border hover:border-admin-primary/50'
                } ${error ? 'border-red-500' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedFormats.join(',')}
                    onChange={handleChange}
                    className="hidden"
                    disabled={uploading || isUploading}
                    id="multi-image-upload"
                />
                
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-admin-background rounded-full flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-admin-text-secondary text-3xl">photo_library</span>
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                type="button" 
                                onClick={() => setIsLibraryOpen(true)}
                                className="px-6 py-2.5 bg-admin-primary text-white font-medium rounded-lg hover:bg-admin-primary-hover transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">photo_library</span>
                                Select from Library
                            </button>
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">upload_file</span>
                                Upload from Device
                            </button>
                        </div>
                        <p className="text-sm text-admin-text-secondary mt-3">
                            or drag and drop images here
                        </p>
                        <p className="text-xs text-admin-text-secondary mt-1">
                            {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} (max {maxSizeMB}MB each)
                        </p>
                        <p className="text-xs text-admin-text-secondary">
                            {images.length} / {maxImages} images selected
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">error</span>
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:text-red-800">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-admin-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-admin-primary font-medium mt-2">Uploading...</p>
                        </div>
                    </div>
                )}

                {isUploading && !uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-admin-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-admin-primary font-medium mt-2">Uploading...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Previews Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((preview, index) => (
                        <div key={preview.id} className="group relative aspect-square bg-admin-surface rounded-lg border border-admin-border overflow-hidden">
                            <img
                                src={preview.url}
                                alt={preview.name}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Overlay info */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="self-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(index)}
                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        aria-label={`Remove ${preview.name}`}
                                    >
                                        <span className="material-symbols-outlined text-sm block">close</span>
                                    </button>
                                </div>
                                <div className="text-white text-xs truncate">
                                    <p className="truncate font-medium">{preview.name}</p>
                                    {preview.size && <p>{formatSize(preview.size)}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MediaLibraryModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                multiple={true}
                maxSelection={Math.max(0, maxImages - images.length)}
                onImagesSelect={handleLibrarySelection}
                title="Select Gallery Images"
            />
        </div>
    );
};
