type EventPayload = Record<string, any>

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const AnalyticsService = {
  track(eventName: string, payload: EventPayload = {}) {
    try {
      // Log to console in dev
      if (import.meta.env.DEV) {
        console.debug('[analytics]', eventName, payload);
      }

      // Push to Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, payload);
      }

      return true;
    } catch (e) {
      console.warn('Analytics tracking failed', e);
      return false;
    }
  },

  // Specific Blog Events
  trackPageView(path: string, title?: string, category?: string) {
    const payload: any = {
      page_path: path,
      page_title: title
    };
    
    if (category) {
      payload.content_group = category;
    }

    this.track('page_view', payload);
  },

  trackScrollDepth(depth: number, path: string) {
    this.track('scroll_depth', {
      depth_percentage: depth,
      page_path: path
    });
  },

  trackTimeOnPage(seconds: number, path: string) {
    this.track('time_on_page', {
      seconds: seconds,
      page_path: path
    });
  },

  trackCtaClick(ctaName: string, destination: string) {
    this.track('cta_click', {
      cta_name: ctaName,
      destination: destination
    });
  },

  trackInternalLinkClick(linkText: string, destination: string) {
    this.track('internal_link_click', {
      link_text: linkText,
      destination: destination
    });
  },

  trackShare(platform: string, path: string) {
    this.track('share', {
      method: platform,
      content_type: 'blog_post',
      item_id: path
    });
  }
}
