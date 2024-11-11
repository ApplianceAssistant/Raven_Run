import React, { useEffect, Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
import themesConfig, { noThemeElementPages } from '../config/themesConfig';

/**
 * BackgroundController component
 * @param {{ theme: keyof typeof themesConfig }} props - The component props
 * @returns {JSX.Element|null}
 */
const BackgroundController = ({ theme }) => {
  const location = useLocation();
  const [EffectComponent, setEffectComponent] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Determine if the background should be displayed based on the current route
  const shouldShowBackground = !noThemeElementPages.includes(location.pathname);

  useEffect(() => {
    const loadBackgroundEffect = async () => {
      if (shouldShowBackground && themesConfig[theme]?.background) {
        try {
          const module = await themesConfig[theme].background();
          setEffectComponent(() => module.default);
          setFadeIn(false); // Reset fade-in state
          // Trigger fade-in after a small delay to ensure component is mounted
          setTimeout(() => setFadeIn(true), 50);
        } catch (error) {
          console.error("Failed to load background effect:", error);
          setEffectComponent(null);
        }
      } else {
        setEffectComponent(null);
      }
    };

    loadBackgroundEffect();
  }, [theme, shouldShowBackground]);

  return (
    <Suspense fallback={<div className="loading-background">Loading...</div>}>
      {EffectComponent && (
        <div className={`theme-background ${fadeIn ? 'fade-in' : ''}`}>
          <EffectComponent />
        </div>
      )}
      
    </Suspense>
  );
};

export default BackgroundController;
