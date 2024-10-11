import { useState, useEffect, useRef } from 'react';
import { handleError } from '../utils/utils';

const LOCATION_UPDATE_INTERVAL = 1000; // 1 second in milliseconds

export const useLocationWatcher = () => {
  const [userLocation, setUserLocation] = useState(null);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentTime = Date.now();
          if (currentTime - lastUpdateTime.current >= LOCATION_UPDATE_INTERVAL) {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            });
            lastUpdateTime.current = currentTime;
          }
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

  return userLocation;
};