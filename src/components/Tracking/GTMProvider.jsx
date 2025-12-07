import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../../utils/tracking";

/**
 * GTMProvider Component
 *
 * This component initializes Google Tag Manager and tracks page views
 * on route changes for proper GTM and GA4 integration.
 *
 * Features:
 * - Initializes GTM dataLayer
 * - Tracks page views on route changes
 * - Supports both GTM and GA4 tracking
 */
const GTMProvider = ({ children }) => {
  const location = useLocation();

  // Initialize GTM dataLayer on mount
  useEffect(() => {
    // Ensure dataLayer exists
    if (typeof window !== "undefined" && !window.dataLayer) {
      window.dataLayer = [];
    }

    // Track initial page view
    const currentPath = location.pathname;
    const pageTitle = document.title || "We Buy Any Car";

    trackPageView(currentPath, pageTitle);
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const pageTitle = document.title || "We Buy Any Car";

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      trackPageView(currentPath, pageTitle, {
        page_location: window.location.href,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return <>{children}</>;
};

export default GTMProvider;











