// Handles viewport calculations and device detection
export function setupViewport() {
    // Detect mobile browser
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    function updateViewportProperties() {
        // Get the viewport height
        const vh = window.innerHeight * 0.01;
        
        // Get header height from CSS variable
        const headerHeight = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height')) || 0;
        
        // Set CSS custom properties
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
        
        // For mobile, account for browser chrome
        if (isMobile) {
            // Typical mobile browser chrome is around 75-100px
            const safeVh = (window.innerHeight - (isMobile ? 100 : 0)) * 0.01;
            document.documentElement.style.setProperty('--safe-vh', `${safeVh}px`);
            document.documentElement.style.setProperty('--safe-vh', `${vh}px`);
        } else {
            document.documentElement.style.setProperty('--safe-vh', `${vh}px`);
        }
        
        // Calculate content height (viewport - header)
        const contentVh = ((window.innerHeight - headerHeight) * 0.01);
        document.documentElement.style.setProperty('--content-vh', `${contentVh}px`);
    }

    // Update on mount
    updateViewportProperties();

    // Update on resize and orientation change
    window.addEventListener('resize', updateViewportProperties);
    window.addEventListener('orientationchange', updateViewportProperties);

    // Return cleanup function
    return () => {
        window.removeEventListener('resize', updateViewportProperties);
        window.removeEventListener('orientationchange', updateViewportProperties);
    };
}
