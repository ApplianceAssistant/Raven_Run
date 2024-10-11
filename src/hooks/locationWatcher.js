import { useState, useEffect, useRef, useCallback } from 'react';
import { handleError } from '../utils/utils';

const LOCATION_UPDATE_INTERVAL = 1000; // 1 second in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export const useLocationWatcher = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastUpdateTime = useRef(0);
  const retryCount = useRef(0);

  const getLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
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
          retryCount.current = 0;
          setIsLoading(false);
        },
        (error) => {
          handleError(error, 'Location Watcher');
          if (retryCount.current < MAX_RETRIES) {
            retryCount.current += 1;
            console.log(`Retrying location watch (Attempt ${retryCount.current}/${MAX_RETRIES})...`);
            setTimeout(getLocation, RETRY_DELAY);
          } else {
            console.error('Max retries reached. Unable to get location.');
            setError('Unable to get your location. Please check your device settings or try again.');
            setIsLoading(false);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
    const intervalId = setInterval(getLocation, LOCATION_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [getLocation]);

  const refreshLocation = () => {
    retryCount.current = 0;
    getLocation();
  };

  return { userLocation, error, isLoading, refreshLocation };
};