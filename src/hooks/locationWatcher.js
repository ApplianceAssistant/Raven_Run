// src/hooks/useLocationWatcher.js

import { useState, useEffect } from 'react';
import { handleError } from '../utils/utils';

export const useLocationWatcher = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => handleError(error, 'Location Watcher'),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);
  console.warn("new user location: ", userLocation);
  return userLocation;
};