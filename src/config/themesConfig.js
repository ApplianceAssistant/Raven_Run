import { LazyExoticComponent } from 'react';

/**
 * @typedef {Object} ThemeConfig
 * @property {string} className - The CSS class name for the theme.
 * @property {() => Promise<{ default: LazyExoticComponent<any> }>} background - Lazy-loaded background component.
 */

/** @type {{ spooky: ThemeConfig, pirate: ThemeConfig }} */
export const themesConfig = {
  'default': {
    className: '',
    background: '',
    isCanvasTheme: false,
    style: '',
  },
  'spooky-theme': {
    className: 'spirit-guide',
    background: () => import('../effects/SpiritSpots'),
    isCanvasTheme: false,
    style: () => import('../css/_spooky-theme.scss'),
  },
  'fairyland-theme': {
    className: 'fairy-guide',
    background: () => import('../effects/FallingLeaves'),
    isCanvasTheme: false,
    style: () => import('../css/_fairy-theme.scss'),
  },
  'pirate-theme': {
    className: 'pirate-flag',
    background: () => import('../effects/BurningEmbers'),
    isCanvasTheme: true,
    style: () => import('../css/_pirate-theme.scss'),
  },
  'ocean-theme': {
    className: 'diving-bell',
    background: () => import('../effects/bubbleEffect'),
    isCanvasTheme: false,
    style: () => import('../css/_ocean-theme.scss'),
  },
  'jurassic-theme': {
    className: 'trees',
    background: () => import('../effects/FloatingSpores'),
    isCanvasTheme: false,
    style: () => import('../css/_jurassic-theme.scss'),
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
