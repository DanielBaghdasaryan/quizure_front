import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Make sure the gtag function exists before calling it
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_location: window.location.href,
                page_path: location.pathname,
                page_title: document.title,
            });
        }
    }, [location]);
};

export default usePageTracking;