import React, { useState, useEffect } from 'react';
import { MediaService, MediaFile } from '../../lib/services/mediaService';

interface MediaSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({ 
    isOpen, 
    onClose, 
    onSelect,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        setError(null);
        try {
            const files = await MediaService.getAllMedia();
            // Filter by allowed types
            const filtered = files.filter(f => 
                !allowedTypes.length || (f.mime_type && allowedTypes.includes(f.mime_type))
            );
            setMediaFiles(filtered);
        } catch (err: any) {
            setError(err.message || 'Failed to load media files');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSelectedFile(null); // Deselect when searching to avoid confusion
    };

    const filteredFiles = mediaFiles.filter(file => {
        const query = searchQuery.toLowerCase();
        return (
            file.filename.toLowerCase().includes(query) ||
            (file.title && file.title.toLowerCase().includes(query)) ||
            (file.alt_text && file.alt_text.toLowerCase().includes(query))
        );
    });

    const handleConfirm = () => {
        if (selectedFile && selectedFile.public_url) {
            onSelect(selectedFile.public_url);
            onClose();
        }
    };

    const formatBytes = (bytes: number | null) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-admin-surface w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-admin-border animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-admin-border">
                    <h2 className="text-xl font-bold text-admin-text-primary">Select Media</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-admin-background rounded-full text-admin-text-secondary transition-colors"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-admin-border bg-admin-background/50">
                    <div className="relative max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary">search</span>
                        <input 
                            type="text" 
                            placeholder="Search by filename or title..." 
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg bg-admin-surface text-admin-text-primary focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500">
                                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                                <p>{error}</p>
                                <button onClick={fetchMedia} className="mt-4 px-4 py-2 bg-admin-background rounded-lg hover:bg-admin-border transition-colors text-admin-text-primary">Retry</button>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-admin-text-secondary">
                                <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                <p>No media files found matching your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredFiles.map(file => (
                                    <div 
                                        key={file.id}
                                        onClick={() => setSelectedFile(file)}
                                        className={`
                                            group relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden transition-all
                                            ${selectedFile?.id === file.id 
                                                ? 'border-admin-primary ring-2 ring-admin-primary/20' 
                                                : 'border-admin-border hover:border-admin-text-secondary'}
                                        `}
                                    >
                                        {file.public_url ? (
                                            <img 
                                                src={file.public_url} 
                                                alt={file.alt_text || file.filename}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-admin-background">
                                                <span className="material-symbols-outlined text-gray-400">broken_image</span>
                                            </div>
                                        )}
                                        
                                        {/* Overlay with info on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                            <p className="text-white text-xs truncate font-medium">{file.filename}</p>
                                            <p className="text-gray-300 text-[10px]">{formatBytes(file.size_bytes)}</p>
                                        </div>

                                        {/* Selection Checkmark */}
                                        {selectedFile?.id === file.id && (
                                            <div className="absolute top-2 right-2 bg-admin-primary text-white rounded-full p-1 shadow-sm">
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Preview (Desktop only) */}
                    {selectedFile && (
                        <div className="hidden lg:block w-80 bg-admin-background border-l border-admin-border p-4 overflow-y-auto">
                            <h3 className="font-semibold text-admin-text-primary mb-4">File Details</h3>
                            <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden border border-admin-border mb-4 flex items-center justify-center">
                                {selectedFile.public_url && (
                                    <img 
                                        src={selectedFile.public_url} 
                                        alt={selectedFile.alt_text || "Preview"} 
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="text-admin-text-secondary text-xs block">Filename</label>
                                    <p className="text-admin-text-primary break-all font-medium">{selectedFile.filename}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-admin-text-secondary text-xs block">Size</label>
                                        <p className="text-admin-text-primary">{formatBytes(selectedFile.size_bytes)}</p>
                                    </div>
                                    <div>
                                        <label className="text-admin-text-secondary text-xs block">Type</label>
                                        <p className="text-admin-text-primary">{selectedFile.mime_type}</p>
                                    </div>
                                </div>
                                {(selectedFile.width && selectedFile.height) && (
                                     <div>
                                        <label className="text-admin-text-secondary text-xs block">Dimensions</label>
                                        <p className="text-admin-text-primary">{selectedFile.width} x {selectedFile.height} px</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-admin-text-secondary text-xs block">Uploaded</label>
                                    <p className="text-admin-text-primary">{new Date(selectedFile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-admin-border bg-admin-surface flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-admin-border rounded-lg text-sm font-semibold hover:bg-admin-background transition-colors text-admin-text-primary"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedFile}
                        className="px-4 py-2 bg-admin-primary text-white font-semibold rounded-lg shadow-sm hover:bg-admin-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">check</span>
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaSelectorModal;
