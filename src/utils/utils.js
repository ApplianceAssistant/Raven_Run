// src/utils/utils.js

import axios from 'axios';
import React from 'react'; // Import React for JSX usage

const getApiUrl = () => {
  return process.env.REACT_APP_URL;
};

export const API_URL = getApiUrl();

// Configure axios defaults
axios.defaults.baseURL = API_URL;  // Revert back to original configuration
axios.defaults.withCredentials = true; // Enable CORS credentials

// Get salt from environment variables
const SALT = process.env.REACT_APP_SALT;
if (!SALT) {
  throw new Error('Security configuration error: SALT not found in environment');
}

/**
 * Hash a password using SHA-256 and return a base64 string
 * Note: This is for initial hashing only. The server will apply additional hashing.
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hashed password
 */
export async function hashPassword(password) {
  try {
    if (!password) {
      throw new Error('Password is required');
    }

    // Convert password string to bytes
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password + SALT);

    // Hash the password using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);

    // Convert hash to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password processing failed');
  }
}

//function to detect the need for content scrolling
export function handleScroll(contentWrapper, contentHeader, bodyContent, scrollIndicator) {

  if (contentWrapper && contentHeader && bodyContent && scrollIndicator) {
    const isScrollable = bodyContent.scrollHeight > bodyContent.clientHeight;
    const isScrolledToTop = bodyContent.scrollTop === 0;
    const isScrolledToBottom = bodyContent.scrollTop + bodyContent.clientHeight >= bodyContent.scrollHeight - 20;

    // Handle fixed header
    if (isScrollable && bodyContent.scrollTop > 0) {
      contentHeader.classList.add('fixed');
    } else {
      contentHeader.classList.remove('fixed');
    }
    // Handle scroll indicator
    if (isScrollable) {
      const arrows = scrollIndicator.querySelectorAll('.arrow');
      arrows.forEach(arrow => arrow.classList.remove('active'));
      if (isScrolledToTop) {
        scrollIndicator.querySelector('.arrow.down').classList.add('visible', 'active');
        scrollIndicator.querySelector('.arrow.up').classList.remove('visible', 'active');
        scrollIndicator.querySelector('.arrow.updown').classList.remove('active', 'visible');
      } else if (isScrolledToBottom) {
        scrollIndicator.querySelector('.arrow.up').classList.add('active', 'visible');
        scrollIndicator.querySelector('.arrow.updown').classList.remove('active', 'visible');
        scrollIndicator.querySelector('.arrow.down').classList.remove('active', 'visible');
      } else {
        scrollIndicator.querySelector('.arrow.updown').classList.add('active', 'visible');
        scrollIndicator.querySelector('.arrow.up').remove('active', 'visible');
        scrollIndicator.querySelector('.arrow.down').remove('active', 'visible');
      }
    } else {
      scrollIndicator.classList.remove('visible');
    }
  }
}

// Function to get user's location
let currentLocation = null;
let locationListeners = [];

export function addLocationListener(listener) {
  locationListeners.push(listener);
}

export function removeLocationListener(listener) {
  locationListeners = locationListeners.filter(l => l !== listener);
}

export function getCurrentLocation() {
  return currentLocation;
}


export const handleError = (error, context) => {
  let errorMessage = `Error in ${context}: `;

  if (error instanceof GeolocationPositionError) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage += "The request to get user location timed out.";
        break;
      default:
        errorMessage += "An unknown error occurred.";
        break;
    }
  } else {
    errorMessage += error.message || 'An unknown error occurred.';
  }

  console.error(errorMessage);
  // Optionally, you could dispatch this error to a global error handling system
  // or update the UI to inform the user about the error
};

export const authFetch = async (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Create a new headers object
  const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers || {})
  });

  // Add authorization header if user has a token
  if (user?.token) {
      headers.set('Authorization', `Bearer ${user.token}`);
  }

  try {
      const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include', // Always include credentials
      });

      // Check for and handle token refresh
      const newToken = response.headers.get('X-New-Token');
      if (newToken && user) {
          const updatedUser = { ...user, token: newToken };
          localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Handle different response statuses
      if (response.status === 401) {
          console.error('Unauthorized access detected');
          // Only clear user data if we're not already on the login page
          if (!window.location.pathname.includes('/log-in')) {
              localStorage.removeItem('user');
              window.location.href = '/log-in';
          }
          throw new Error('Unauthorized access');
      }

      if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
  } catch (error) {
      console.error('Fetch error:', error.message);
      // Add request details to the error
      error.requestUrl = url;
      error.requestOptions = { ...options, headers: Object.fromEntries(headers.entries()) };
      throw error;
  }
};

// Function to check server connectivity and measure response time
export const checkServerConnectivity = async () => {
  try {
    const start = Date.now();
    const response = await axios.get(`${API_URL}/server/tests/healthcheck.php`);
    if (response.data && response.data.status === 'success') {
      return {
        isConnected: true,
        isDatabaseConnected: true,
        message: response.data.message
      };
    } else {
      return {
        isConnected: true,
        isDatabaseConnected: false,
        message: 'Server is up, but database connection failed'
      };
    }
  } catch (error) {
    console.error('Server connectivity check failed:', error);
    return {
      isConnected: false,
      isDatabaseConnected: false,
      error: error.message,
      message: 'Failed to connect to the server'
    };
  }
};

export function calculateDistance(loc1, loc2) {
  if (!loc1 || !loc2) {
    return 0;
  }
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degToRad(loc2.latitude - loc1.latitude);
  const dLon = degToRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(loc1.latitude)) * Math.cos(degToRad(loc2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  const distanceInMeters = distance * 1000; // Convert to meters

  return distanceInMeters;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

export function getUserUnitPreference() {
  const savedUnitSystem = localStorage.getItem('unitSystem');
  return savedUnitSystem ? JSON.parse(savedUnitSystem) : false; // Default to false (imperial) if not set
}

/**
 * Formats a phone number as user types, showing partial formatting
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
        return cleaned;
    } else if (cleaned.length <= 6) {
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3)}`;
    } else {
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}${cleaned.length > 6 ? '-' + cleaned.slice(6, 10) : ''}`;
    }
}

/**
 * Compresses a phone number to just digits
 * @param {string} phone - Phone number in any format
 * @returns {string} Compressed phone number (just digits) or empty string if invalid
 */
export function compressPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? cleaned : '';
}

/**
 * Validates if a phone number has exactly 10 digits
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid 10-digit number
 */
export function isValidPhoneNumber(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
}

/**
 * Cleans and formats text content, handling newlines and optional truncation
 * @param {string} text - The text to clean and format
 * @param {Object} options - Configuration options
 * @param {boolean} [options.asJsx=false] - If true, returns JSX with <br/> tags instead of \n
 * @param {number} [options.maxLength] - Optional maximum length before truncation
 * @param {string} [options.truncationSuffix='...'] - String to append when truncating
 * @returns {string|JSX.Element} Cleaned text, either as string or JSX
 */
export const cleanText = (text, options = {}) => {
    const {
        asJsx = false,
        maxLength,
        truncationSuffix = '...'
    } = options;

    if (!text) return '';

    // Split on newlines and clean each line
    let lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // Join lines based on output format
    let cleaned = asJsx 
        ? lines.map((line, i) => (
            <React.Fragment key={i}>
                {line}
                {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))
        : lines.join('\n');

    // Handle truncation if maxLength is specified
    if (maxLength && typeof cleaned === 'string' && cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength).trim() + truncationSuffix;
    }

    return cleaned;
};

export const generateTempUsername = (email) => {
    const prefix = email.split('@')[0];
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${randomString}`;
};