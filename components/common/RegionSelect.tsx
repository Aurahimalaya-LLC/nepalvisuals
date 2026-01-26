import React, { useState, useRef, useEffect } from 'react';
import { useRegionsData } from '../../lib/hooks/useRegionsData';
import { Region } from '../../lib/services/regionService';

interface RegionSelectProps {
    value?: string;
    onChange: (regionName: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    id?: string;
}

const RegionSelect: React.FC<RegionSelectProps> = ({
    value,
    onChange,
    label = "Region",
    placeholder = "Select a region...",
    required = false,
    error,
    className = "",
    id = "region-select"
}) => {
    const { regions, loading, error: fetchError } = useRegionsData();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter regions based on search
    const filteredRegions = regions.filter(region => 
        region.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery(""); // Reset search on close
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opening
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => (prev < filteredRegions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredRegions.length) {
                    handleSelect(filteredRegions[focusedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchQuery("");
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    // Scroll focused item into view
    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && listRef.current) {
            const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
            if (focusedElement) {
                focusedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [focusedIndex, isOpen]);

    const handleSelect = (region: Region) => {
        onChange(region.name);
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
    };

    const displayValue = value || "";
    const isError = !!error || !!fetchError;
    const errorMessage = error || fetchError;

    /*
      Responsive Design:
      - Touch Targets: min-h-[48px] for main input and options (mobile friendly).
      - Fluid Width: w-full to adapt to container.
      - Media Queries: Could be expanded for full-screen modal on mobile if needed.
    */
    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label 
                    htmlFor={id} 
                    className="text-sm font-medium text-admin-text-primary block mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div
                className={`
                    relative w-full border rounded-lg bg-white text-sm cursor-pointer transition-colors
                    ${isError 
                        ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' 
                        : 'border-admin-border focus-within:ring-2 focus-within:ring-admin-primary focus-within:border-transparent'
                    }
                    ${isOpen ? 'ring-2 ring-admin-primary border-transparent' : ''}
                `}
                onClick={() => !isOpen && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={`${id}-listbox`}
                aria-labelledby={label ? undefined : id} 
                id={id}
            >
                {/* Touch Target: Increased to 48px min-height */}
                <div className="flex items-center justify-between px-3 py-2 min-h-[48px]">
                    <span className={`block truncate ${!displayValue ? 'text-gray-400' : 'text-gray-900'}`}>
                        {displayValue || placeholder}
                    </span>
                    <span className="material-symbols-outlined text-gray-400 text-xl">
                        {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-admin-border rounded-lg shadow-lg max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-admin-border bg-gray-50 sticky top-0">
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full px-2 py-1.5 text-sm border border-admin-border rounded-md focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary"
                            placeholder="Search regions..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setFocusedIndex(0); // Reset focus on search
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                        />
                    </div>
                    
                    <ul
                        ref={listRef}
                        id={`${id}-listbox`}
                        role="listbox"
                        className="overflow-y-auto flex-1 p-1"
                    >
                        {loading ? (
                            <li className="px-3 py-3 text-gray-500 text-center text-sm">Loading regions...</li>
                        ) : filteredRegions.length === 0 ? (
                            <li className="px-3 py-3 text-gray-500 text-center text-sm">No regions found</li>
                        ) : (
                            filteredRegions.map((region, index) => (
                                <li
                                    key={region.id}
                                    role="option"
                                    aria-selected={value === region.name}
                                    className={`
                                        px-3 py-3 text-sm rounded-md cursor-pointer flex items-center justify-between min-h-[48px]
                                        ${index === focusedIndex ? 'bg-admin-primary/10 text-admin-primary' : 'text-gray-700 hover:bg-gray-100'}
                                        ${value === region.name ? 'font-medium bg-gray-50' : ''}
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(region);
                                    }}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                >
                                    <span>{region.name}</span>
                                    {value === region.name && (
                                        <span className="material-symbols-outlined text-admin-primary text-lg">check</span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {isError && (
                <p className="text-xs text-red-600 mt-1" role="alert">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default RegionSelect;
