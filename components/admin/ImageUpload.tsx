import React, { useRef, useState } from 'react';

interface ImageUploadProps {
    label: string;
    image: string;
    alt: string;
    onImageChange: (dataUrl: string) => void;
    onAltChange: (alt: string) => void;
    className?: string;
    helpText?: string;
    aspectRatio?: 'video' | 'square' | 'wide';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    image,
    alt,
    onImageChange,
    onAltChange,
    className = '',
    helpText,
    aspectRatio = 'video'
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onImageChange(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square': return 'aspect-square';
            case 'wide': return 'aspect-[2/1]';
            default: return 'aspect-video';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <label className="block text-sm font-medium text-admin-text-secondary">{label}</label>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Image Preview / Upload Area */}
                <div 
                    className={`w-full md:w-1/3 ${getAspectRatioClass()} rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group
                    ${isDragging ? 'border-admin-primary bg-admin-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {image ? (
                        <>
                            <img 
                                src={image} 
                                alt={alt || 'Preview'} 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined">edit</span>
                                    Change Image
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">add_photo_alternate</span>
                            <p className="text-xs text-gray-500 font-medium">Click to upload</p>
                            <p className="text-[10px] text-gray-400 mt-1">or drag and drop</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                {/* Alt Text & Details */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-admin-text-secondary mb-1">
                            Alt Text (Required for SEO)
                        </label>
                        <input
                            type="text"
                            value={alt}
                            onChange={(e) => onAltChange(e.target.value)}
                            placeholder="Describe the image content..."
                            className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm bg-admin-background focus:ring-2 focus:ring-admin-primary outline-none"
                        />
                        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
                    </div>
                    
                    {image && (
                         <div className="flex gap-2">
                             <button 
                                type="button"
                                onClick={() => onImageChange('')}
                                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                             >
                                 <span className="material-symbols-outlined text-sm">delete</span>
                                 Remove Image
                             </button>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
