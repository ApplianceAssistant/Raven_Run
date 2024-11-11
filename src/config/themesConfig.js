import { LazyExoticComponent } from 'react';

/**
 * @typedef {Object} ThemeConfig
 * @property {string} className - The CSS class name for the theme.
 * @property {() => Promise<{ default: LazyExoticComponent<any> }>} background - Lazy-loaded background component.
 */

/** @type {{ spooky: ThemeConfig, pirate: ThemeConfig }} */
const themesConfig = {
  'spooky-theme': {
    className: 'spirit-guide',
    background: () => import('../effects/SpiritSpots'),
  },
  'fairyland-theme': {
    className: 'spirit-guide',
    background: () => import('../effects/FallingLeaves'),
  },
  'pirate-theme': {
    className: 'pirate-theme',
    background: () => import('../effects/BurningEmbers'),
  },
  'ocean-theme': {
    className: 'ocean-theme',
    background: () => import('../effects/bubbleEffect'),
  },
};

// Routes where backgrounds should not be shown
export const noThemeElementPages = [
  '/profile',
  '/friends',
  '/create',
  '/thank_you'
];

export default themesConfig;
