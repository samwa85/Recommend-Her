import { useEffect } from 'react';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Custom hook for analytics tracking
 * Supports Google Analytics 4 and can be extended for other providers
 */
export const useAnalytics = () => {
  const isAnalyticsEnabled = import.meta.env['VITE_ENABLE_ANALYTICS'] === 'true';

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (!isAnalyticsEnabled || typeof window === 'undefined') return;

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('config', import.meta.env['VITE_GA_TRACKING_ID'], {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics] Page View:', { pagePath, pageTitle });
    }
  };

  const trackEvent = ({ category, action, label, value }: AnalyticsEvent) => {
    if (!isAnalyticsEnabled || typeof window === 'undefined') return;

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics] Event:', { category, action, label, value });
    }
  };

  const trackFormSubmit = (formName: string) => {
    trackEvent({
      category: 'Form',
      action: 'submit',
      label: formName,
    });
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent({
      category: 'Button',
      action: 'click',
      label: `${location ? `${location} - ` : ''}${buttonName}`,
    });
  };

  const trackNavigation = (destination: string) => {
    trackEvent({
      category: 'Navigation',
      action: 'click',
      label: destination,
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackFormSubmit,
    trackButtonClick,
    trackNavigation,
  };
};

/**
 * Hook to automatically track page views
 */
export const usePageTracking = () => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname, document.title);

    // Track route changes (if using React Router)
    const handleRouteChange = () => {
      trackPageView(window.location.pathname, document.title);
    };

    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageView]);
};
