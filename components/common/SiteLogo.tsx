import React, { useState, useEffect } from 'react';
import { SettingsService } from '../../lib/services/settingsService';

interface SiteLogoProps {
    className?: string;
    alt?: string;
}

const DEFAULT_LOGO = 'https://i.imgur.com/3Cn1g28.png';
const CACHE_KEY = 'site_branding_settings';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedBranding {
    data: { logo_url: string };
    timestamp: number;
}

const SiteLogo: React.FC<SiteLogoProps> = ({ className = "h-8", alt = "Site Logo" }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchLogo = async () => {
            // Check cache first
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed: CachedBranding = JSON.parse(cached);
                    const now = Date.now();
                    
                    // Check if cache is valid and not expired
                    if (parsed.data?.logo_url && (now - parsed.timestamp < CACHE_DURATION)) {
                        if (isMounted) {
                            setLogoUrl(parsed.data.logo_url);
                            setLoading(false);
                        }
                        return;
                    }
                } catch (e) {
                    sessionStorage.removeItem(CACHE_KEY);
                }
            }

            try {
                const settings = await SettingsService.getAllSettings();
                
                if (isMounted) {
                    if (settings.branding?.logo_url) {
                        setLogoUrl(settings.branding.logo_url);
                        
                        // Update cache with timestamp
                        const cacheData: CachedBranding = {
                            data: settings.branding,
                            timestamp: Date.now()
                        };
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                    } else {
                        setLogoUrl(DEFAULT_LOGO);
                    }
                }
            } catch (err) {
                console.error('Failed to load logo settings:', err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLogo();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleImageError = () => {
        if (!error) setError(true);
    };

    if (loading) {
        // Render a skeleton placeholder that roughly matches the logo aspect ratio
        // Using a width/height style or class to prevent layout shift would be ideal, 
        // but className usually handles height (e.g., h-8).
        return (
            <div 
                className={`${className} bg-white/10 animate-pulse rounded-md`} 
                role="status" 
                aria-label="Loading logo"
                style={{ width: 'auto', minWidth: '100px' }}
            ></div>
        );
    }

    // Determine the source:
    // 1. If error occurred, use default
    // 2. If we have a fetched URL, use it
    // 3. Fallback to default
    const src = (error || !logoUrl) ? DEFAULT_LOGO : logoUrl;

    return (
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
            onError={handleImageError}
            loading="eager" // Logo is critical above-the-fold content
        />
    );
};

export default SiteLogo;
