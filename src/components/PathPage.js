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
  const [targetLocation, setTargetLocation] = useState({ latitude: 0, longitude: 0 });
  const [distance, setDistance] = useState(null);
  const [isSpiritGuideSmall, setIsSpiritGuideSmall] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

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
    const locationInterval = setInterval(fetchUserLocation, 60000);

    setChallenges(getChallenges());

    // Trigger spirit guide transition to small guide
    setIsSpiritGuideSmall(true);
    // Trigger text fade-in after spirit guide transition
    const textFadeTimer = setTimeout(() => setTextVisible(true), 500);

    return () => {
      clearInterval(locationInterval);
      clearTimeout(textFadeTimer);
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
  };

  

return (
  <div className="path-page">
    <main className="path-content">
      <div className={`page-text ${textVisible ? 'visible' : ''}`}>
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
    <SpiritGuide isSmall={isSpiritGuideSmall} distance={distance} />
  </div>
);
}

export default PathPage;