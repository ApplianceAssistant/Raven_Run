import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import SpiritGuide from './SpiritGuide';
import { Challenge } from './Challenge';
import { getChallenges } from '../services/challengeService.ts';
import { checkServerConnectivity, getUserLocation } from '../utils/utils';

function PathPage() {
  const { pathName } = useParams();
  const [userLocation, setUserLocation] = useState(null);
  const [targetLocation, setTargetLocation] = useState({ latitude: 0, longitude: 0 }); // Example target
  const [distance, setDistance] = useState(null);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);

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

    // Fetch challenges
    setChallenges(getChallenges());

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

  useEffect(() => {
    if (challenges.length > 0 && challengeIndex < challenges.length) {
      setCurrentChallenge(challenges[challengeIndex]);
    }
  }, [challenges, challengeIndex]);

  const calculateDistance = (loc1, loc2) => {
    // ... (keep the existing calculateDistance function)
  };

  const handleChallengeComplete = (correct) => {
    if (correct) {
      setChallengeIndex(prevIndex => prevIndex + 1);
    }
    // You might want to add some logic here for incorrect answers
    // For example, you could decrease the player's score or give them a penalty
  };

  return (
    <div className="path-page">
      <Header />
      <main className="path-content">
        <div className={`main-oval ${transitionComplete ? 'fade-out' : ''}`}></div>
        <div className={`page-text ${transitionComplete ? 'fade-in' : ''}`}>
          <h1>{pathName}</h1>
          {distance !== null && (
            <p>Distance to target: {distance.toFixed(2)} km</p>
          )}
        </div>
        {currentChallenge && (
          <Challenge 
            challenge={currentChallenge} 
            onComplete={handleChallengeComplete} 
          />
        )}
      </main>
      {transitionComplete && <SpiritGuide distance={distance} />}
    </div>
  );
}

export default PathPage;