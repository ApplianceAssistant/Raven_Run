// Handles viewport height calculations, accounting for mobile browser chrome
export function setupViewportHeight() {
    // Set initial viewport height
    const setVH = () => {
        // First we get the viewport height and multiply it by 1% to get a value for a vh unit
        const vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set the initial value
    setVH();

    // Add event listener for resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Return cleanup function
    return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
    };
}
