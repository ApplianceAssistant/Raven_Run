// src/utils/utils.js

import axios from 'axios';

export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://crowtours.com/api'
  : 'http://localhost:5000/api';

//debugger;
console.log('Current environment:', process.env.NODE_ENV);
console.log('API_URL:', API_URL);

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
    console.warn("isScrollable: ", isScrollable);
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

// Function to get user's location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          console.log('New location:', location);
          localStorage.setItem('userLocation', JSON.stringify(location));
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error.code, error.message);
          reject(error);
        },
        options
      );
    }
  });
}

// Consider using watchPosition for continuous updates
let watchId;

function startLocationWatch() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      updateLocation,
      handleLocationError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
}

function updateLocation(position) {
  const location = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp
  };
  console.log('Location updated:', location);
  // Update your app state or trigger distance recalculation here
}

function handleLocationError(error) {
  console.error('Location watch error:', error.code, error.message);
  // Handle the error appropriately in your app
}

function stopLocationWatch() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export const authFetch = async (url, options = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
  };

  if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
  }

  console.log('Fetching URL:', url);
  console.log('Fetch options:', { ...options, headers });

  try {
      const response = await fetch(url, {
          ...options,
          headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.status === 401) {
          console.error('Unauthorized access, user might need to log in again');
          // Clear user data and logout
          localStorage.removeItem('user');
          window.location.reload();
      }

      return response;
  } catch (error) {
      console.error('Fetch error:', error);
      throw error;
  }
};

export async function updateUserLocation() {
  try {
    const location = await getUserLocation();
    currentLocation = location;
    locationListeners.forEach(listener => listener(location));
    return location;
  } catch (error) {
    console.error("Error updating user location:", error);
  }
}



// Function to check server connectivity and measure response time
export const checkServerConnectivity = async () => {
  try {
    console.log("request url: ", `${API_URL}/db-test.php`);
    const response = await axios.get(`${API_URL}/db-test.php`);
    console.log("response: ", response);
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

// Function to stop location updates
export const stopLocationUpdates = (intervalId) => {
  clearInterval(intervalId);
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

  console.log(`Calculated distance: ${distanceInMeters} meters`);
  return distanceInMeters;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}

export function getUserUnitPreference() {
  const savedUnitSystem = localStorage.getItem('unitSystem');
  return savedUnitSystem ? JSON.parse(savedUnitSystem) : false; // Default to false (imperial) if not set
}