// src/utils/utils.js

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp, faHandPointDown, faHandsUpDown } from '@fortawesome/free-solid-svg-icons';

//function to detect the need for content scrolling
export function handleScroll() {
  const contentWrapper = document.querySelector('.oval-content');
  const contentHeader = document.querySelector('.contentHeader');
  const bodyContent = document.querySelector('.bodyContent');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
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
      scrollIndicator.classList.add('visible');
      const arrows = scrollIndicator.querySelectorAll('.arrow');
      
      arrows.forEach(arrow => arrow.classList.remove('active'));
      
      if (isScrolledToTop) {
        scrollIndicator.querySelector('.arrow.down').classList.add('active');
      } else if (isScrolledToBottom) {
        scrollIndicator.querySelector('.arrow.up').classList.add('active');
      } else {
        scrollIndicator.querySelector('.arrow.updown').classList.add('active');
      }
    } else {
      scrollIndicator.classList.remove('visible');
    }
  }
}

// Function to get user's location
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          // Save to local storage
          localStorage.setItem('userLocation', JSON.stringify(location));
          resolve(location);
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};

// Function to update user's location
export const updateUserLocation = () => {
  return getUserLocation();
};

// Function to check server connectivity and measure response time
export const checkServerConnectivity = async (serverUrl = 'YOUR_SERVER_URL_HERE') => {
  const startTime = Date.now();
  try {
    await axios.get(serverUrl);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    return {
      isConnected: true,
      responseTime: responseTime
    };
  } catch (error) {
    return {
      isConnected: false,
      responseTime: null,
      error: error.message
    };
  }
};

// Function to periodically update location
export const startLocationUpdates = (interval = 300000) => { // Default: update every 5 minutes
  return setInterval(updateUserLocation, interval);
};

// Function to stop location updates
export const stopLocationUpdates = (intervalId) => {
  clearInterval(intervalId);
};