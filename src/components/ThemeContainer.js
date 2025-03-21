import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundController from '../utils/backgroundController';
import themesConfig, { noThemeElementPages } from '../config/themesConfig';
import { animateSeaSurface } from '../effects/PirateElements';

/**
 * ThemeContainer component
 * @param {{ theme: keyof themesConfig, children: React.ReactNode }} props - Component props
 * @returns {JSX.Element}
 */
const ThemeContainer = ({ children, theme }) => {
  const location = useLocation();
  const { className, isCanvasTheme, style } = themesConfig[theme] || {};
  const canvasRef = useRef(null);
  // Cancel speech when route changes
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [location]);

  // Initialize Canvas animation if the theme requires a Canvas
  useEffect(() => {
    if (!isCanvasTheme || !canvasRef.current) return;
  
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
  
      if (theme === 'pirate-theme') {
        animateSeaSurface(ctx, canvas);
      }
  
      return () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
    }, [isCanvasTheme, theme]);

  // Determine if we should show the theme element based on the current route
  const shouldShowThemeElement = !noThemeElementPages.includes(location.pathname);

  return (
    <div className="content-wrapper">
      {shouldShowThemeElement && <div className={`theme-element ${className}`} />}
      {isCanvasTheme && <canvas ref={canvasRef} className="theme-canvas" />}
      <BackgroundController theme={theme} />
      <div className={`content`}>{children}</div>
    </div>
  );
};

export default ThemeContainer;
