import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SpiritGuide from './SpiritGuide';
import { Challenge } from './Challenge';
import { getChallenges, getPathName, resetFeedbackCycle } from '../services/challengeService.ts';
import { calculateDistance, getCurrentLocation, addLocationListener, removeLocationListener } from '../utils/utils.js';

function PathPage() {
  const { pathId } = useParams();
  const [pathName, setPathName] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [challengeVisible, setChallengeVisible] = useState(true);
  const [isSpiritGuideSmall, setIsSpiritGuideSmall] = useState(false);
  const [distance, setDistance] = useState(null);

  const targetLocationRef = useRef(null);
  const distanceNoticeRef = useRef(null);
  const distanceElementRef = useRef(null);

  const updateDistance = useCallback(() => {
    const userLocation = getCurrentLocation();
    if (userLocation && targetLocationRef.current) {
      const distanceInMeters = calculateDistance(userLocation, targetLocationRef.current);
      const distanceInMiles = (distanceInMeters / 1609.344).toFixed(2);
      const newDistance = parseFloat(distanceInMiles);
      setDistance(newDistance);
      
      if (distanceInMiles >= 0.1) {
        updateDistanceDisplay(distanceInMiles, 'miles');
      } else {
        const distanceInFeet = Math.round(distanceInMiles * 5280);
        updateDistanceDisplay(distanceInFeet, 'feet');
      }
    } else {
      setDistance(null);
      if (distanceNoticeRef.current) {
        distanceNoticeRef.current.style.display = 'none';
      }
    }
  }, []);

  const updateDistanceDisplay = (value, unit) => {
    if (!distanceNoticeRef.current) {
      distanceNoticeRef.current = document.querySelector('.distance-notice');
    }
    if (!distanceElementRef.current) {
      distanceElementRef.current = document.getElementById('distanceToTarget');
    }
    
    if (distanceNoticeRef.current && distanceElementRef.current) {
      distanceElementRef.current.textContent = value;
      distanceElementRef.current.nextElementSibling.textContent = unit;
      distanceNoticeRef.current.style.display = 'block';
    }
  };

  useEffect(() => {
    const numericPathId = parseInt(pathId, 10);
    const fetchedChallenges = getChallenges(numericPathId);
    setChallenges(fetchedChallenges);
    setPathName(getPathName(numericPathId));

    fetchedChallenges.forEach(challenge => resetFeedbackCycle(challenge.id));

    addLocationListener(updateDistance);

    // Trigger fade-in effect
    const fadeInTimer = setTimeout(() => {
      setContentVisible(true);
      setIsSpiritGuideSmall(true);
    }, 1000);

    return () => {
      clearTimeout(fadeInTimer);
      removeLocationListener(updateDistance);
    };
  }, [pathId, updateDistance]);

  useEffect(() => {
    if (challenges.length > 0 && challengeIndex < challenges.length) {
      const challenge = challenges[challengeIndex];
      resetFeedbackCycle(challenge.id);
      if (challenge.targetLocation) {
        targetLocationRef.current = challenge.targetLocation;
      } else {
        targetLocationRef.current = null;
      }
      updateDistance();
    }
  }, [challenges, challengeIndex, updateDistance]);

  const handleChallengeComplete = useCallback((correct) => {
    if (correct) {
      setChallengeVisible(false); // Start fade-out
      setTimeout(() => {
        setChallengeIndex(prevIndex => prevIndex + 1);
        setTimeout(() => {
          setChallengeVisible(true); // Start fade-in for new challenge
        }, 50);
      }, 500); // Wait for fade-out to complete
    }
  }, []);

  const currentChallenge = challenges[challengeIndex];

  return (
    <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
      <main className="path-content">
        <h1 className="path-title">{pathName}</h1>
        <p className="distance-notice" style={{ display: 'none' }}>
          Distance to target: <span id="distanceToTarget"></span> <span id="distanceToTargetUnit"></span>
        </p>
        <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
          {currentChallenge && (
            <Challenge
              key={challengeIndex}
              challenge={currentChallenge}
              onComplete={handleChallengeComplete}
              userLocation={getCurrentLocation()}
            />
          )}
        </div>
      </main>
      <SpiritGuide isSmall={isSpiritGuideSmall} distance={distance} />
    </div>
  );
}

export default PathPage;