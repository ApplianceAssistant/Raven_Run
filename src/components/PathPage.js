import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SpiritGuide from './SpiritGuide';
import { checkServerConnectivity, getUserLocation } from '../utils/utils';

function PathPage() {
  const { pathName } = useParams();
  const [userLocation, setUserLocation] = useState(null);
  const [targetLocation, setTargetLocation] = useState({ latitude: 0, longitude: 0 }); // Example target
  const [distance, setDistance] = useState(null);
  const [transitionComplete, setTransitionComplete] = useState(false);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    };

    fetchUserLocation();
    const locationInterval = setInterval(fetchUserLocation, 60000); // Update every minute

    // Trigger transition after a short delay
    const transitionTimer = setTimeout(() => setTransitionComplete(true), 500);

    return () => {
      clearInterval(locationInterval);
      clearTimeout(transitionTimer);
    };
  }, []);

  useEffect(() => {
    if (userLocation && targetLocation) {
      const dist = calculateDistance(userLocation, targetLocation);
      setDistance(dist);
    }
  }, [userLocation, targetLocation]);

  const calculateDistance = (loc1, loc2) => {
    // ... (keep the existing calculateDistance function)
  };

  return (
    <div className="path-page">
      <Header />
      <main className="path-content">
        <div className={`main-oval ${transitionComplete ? 'fade-out' : ''}`}></div>
        <div className={`page-text ${transitionComplete ? 'fade-in' : ''}`}>
          <h1>{pathName}</h1>
          <p>Welcome to {pathName}! Your adventure begins here.</p>
          {distance !== null && (
            <p>Distance to target: {distance.toFixed(2)} km</p>
          )}
        </div>
      </main>
      {transitionComplete && <SpiritGuide distance={distance} />}
    </div>
  );
}

export default PathPage;