import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SpiritGuide from './SpiritGuide';
import { Challenge } from './Challenge';
import { getChallenges, getPathName, resetFeedbackCycle } from '../services/challengeService.ts';
import { getUserLocation, calculateDistance } from '../utils/utils.js';

function PathPage({ userLocation }) {
  const { pathId } = useParams();
  const [pathName, setPathName] = useState('');
  const [targetLocation, setTargetLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isSpiritGuideSmall, setIsSpiritGuideSmall] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);


  useEffect(() => {
    const numericPathId = parseInt(pathId, 10);
    const fetchedChallenges = getChallenges(numericPathId);
    setChallenges(fetchedChallenges);
    setPathName(getPathName(numericPathId));

    fetchedChallenges.forEach(challenge => resetFeedbackCycle(challenge.id));

    setIsSpiritGuideSmall(true);
    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);

    return () => {
      clearTimeout(textFadeTimer);
    };
  }, [pathId]);

  useEffect(() => {
    if (challenges.length > 0 && challengeIndex < challenges.length) {
      const challenge = challenges[challengeIndex];
      setCurrentChallenge(challenge);
      resetFeedbackCycle(challenge.id);
      if (challenge.type === 'travel' && challenge.targetLocation) {
        setTargetLocation(challenge.targetLocation);
      }
    }
  }, [challenges, challengeIndex]);

  useEffect(() => {
    if (userLocation && targetLocation) {
      updateDistance(userLocation, targetLocation);
    }
  }, [userLocation, targetLocation]);

  const updateDistance = (userLoc, targetLoc) => {
    const distanceInMeters = calculateDistance(userLoc, targetLoc);
    const distanceInMiles = (distanceInMeters / 1609.344).toFixed(2);
    if (distanceInMiles >= 0.1) {
      setDistance({
        value: distanceInMiles,
        unit: 'miles'
      });
    } else {
      const distanceInFeet = Math.round(distanceInMiles * 5280);
      setDistance({
        value: distanceInFeet,
        unit: 'feet'
      });
    }
  };

  const handleChallengeComplete = (correct) => {
    if (correct) {
      setChallengeIndex(prevIndex => prevIndex + 1);
      onLocationUpdate(); // Fetch new location when challenge is completed
    }
  };
  return (
    <div className="path-page">
      <main className="path-content">
        <h1 className={`path-title ${textVisible ? 'visible' : ''}`}>{pathName}</h1>
        {distance !== null && (
          <p className="distance-notice">Distance to target: <span id="distanceToTarget">{distance.value}</span> <span id="distanceToTargetUnit">{distance.unit}</span></p>
        )}
        {currentChallenge && (
          <Challenge
            challenge={currentChallenge}
            onComplete={handleChallengeComplete}
            userLocation={userLocation}
          />
        )}
      </main>
      <SpiritGuide isSmall={isSpiritGuideSmall} distance={distance} />
    </div>
  );
}

export default PathPage;