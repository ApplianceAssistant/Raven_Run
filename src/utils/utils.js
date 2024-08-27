// src/utils/utils.js

import axios from 'axios';

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