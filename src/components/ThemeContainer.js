import React from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundController from '../utils/backgroundController';
import themesConfig, { noThemeElementPages } from '../config/themesConfig';

/**
 * ThemeContainer component
 * @param {{ theme: keyof themesConfig, children: React.ReactNode }} props - Component props
 * @returns {JSX.Element}
 */
const ThemeContainer = ({ children, theme }) => {
  console.warn("SET theme: ", theme);
  const location = useLocation();
  const { className } = themesConfig[theme] || {};
  console.warn("SET className: ", className);
  // Determine if we should apply theme-element based on route
  const shouldShowThemeElement = !noThemeElementPages.includes(location.pathname);
  return (
    <div className="content-wrapper">
      {shouldShowThemeElement && <div className={`theme-element ${className}`}></div>}
      <BackgroundController theme={theme} />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default ThemeContainer;
