import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SpiritGuide from './SpiritGuide';
import { Challenge } from './Challenge';
import { getChallenges, resetFeedbackCycle } from '../services/challengeService.ts';
import { checkServerConnectivity, getUserLocation } from '../utils/utils';

function PathPage({ userLocation }) {
  const { pathName } = useParams();
  const [targetLocation, setTargetLocation] = useState({ latitude: 0, longitude: 0 });
  const [distance, setDistance] = useState(null);
  const [isSpiritGuideSmall, setIsSpiritGuideSmall] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const fetchedChallenges = getChallenges();
    setChallenges(fetchedChallenges);

    fetchedChallenges.forEach(challenge => resetFeedbackCycle(challenge.id));

    setIsSpiritGuideSmall(true);
    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);

    return () => {
      clearTimeout(textFadeTimer);
    };
  }, []);

  useEffect(() => {
    if (challenges.length > 0 && challengeIndex < challenges.length) {
      setCurrentChallenge(challenges[challengeIndex]);
      resetFeedbackCycle(challenges[challengeIndex].id);
    }
  }, [challenges, challengeIndex]);

  const handleChallengeComplete = (correct) => {
    if (correct) {
      setChallengeIndex(prevIndex => prevIndex + 1);
    }
  };

  return (
    <div className="path-page">
      <main className="path-content">
        <h1 className={`path-title ${textVisible ? 'visible' : ''}`}>{pathName}</h1>
        {distance && (
          <p className="distance-notice">Distance to target: {distance.toFixed(2)} km</p>
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