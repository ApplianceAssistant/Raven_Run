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
  const [textVisible, setTextVisible] = useState(false);

  const targetLocationRef = useRef(null);
  const distanceRef = useRef(null);
  const isSpiritGuideSmallRef = useRef(false);
  const currentChallengeRef = useRef(null);

  const distanceElementRef = useRef(null);
  const distanceNoticeRef = useRef(null);
  
  const updateDistance = useCallback(() => {
    const userLocation = getCurrentLocation();
    if (userLocation && targetLocationRef.current) {
      const distanceInMeters = calculateDistance(userLocation, targetLocationRef.current);
      const distanceInMiles = (distanceInMeters / 1609.344).toFixed(2);
      if (distanceInMiles >= 0.1) {
        distanceRef.current = {
          value: distanceInMiles,
          unit: 'miles'
        };
      } else {
        const distanceInFeet = Math.round(distanceInMiles * 5280);
        distanceRef.current = {
          value: distanceInFeet,
          unit: 'feet'
        };
      }
      
      // Update DOM directly
      requestAnimationFrame(() => {
        updateDistanceDisplay();
      });
    } else {
      distanceRef.current = null;
      // Hide distance notice
      requestAnimationFrame(() => {
        if (distanceNoticeRef.current) {
          distanceNoticeRef.current.style.display = 'none';
        }
      });
    }
  }, []);

  const updateDistanceDisplay = () => {
    if (!distanceNoticeRef.current) {
      distanceNoticeRef.current = document.querySelector('.distance-notice');
    }
    if (!distanceElementRef.current) {
      distanceElementRef.current = document.getElementById('distanceToTarget');
    }
    if (distanceNoticeRef.current && distanceElementRef.current && distanceRef.current) {
      distanceElementRef.current.textContent = distanceRef.current.value;
      distanceElementRef.current.nextElementSibling.textContent = distanceRef.current.unit;
      distanceNoticeRef.current.style.display = 'block';
    }
  };

  useEffect(() => {
    const numericPathId = parseInt(pathId, 10);
    const fetchedChallenges = getChallenges(numericPathId);
    setChallenges(fetchedChallenges);
    setPathName(getPathName(numericPathId));

    fetchedChallenges.forEach(challenge => resetFeedbackCycle(challenge.id));

    isSpiritGuideSmallRef.current = true;
    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);

    // Add location listener
    addLocationListener(updateDistance);

    return () => {
      clearTimeout(textFadeTimer);
      removeLocationListener(updateDistance);
    };
  }, [pathId, updateDistance]);

  useEffect(() => {
    if (challenges.length > 0 && challengeIndex < challenges.length) {
      const challenge = challenges[challengeIndex];
      currentChallengeRef.current = challenge;
      resetFeedbackCycle(challenge.id);
      if (challenge.type === 'travel' && challenge.targetLocation) {
        targetLocationRef.current = challenge.targetLocation;
      } else {
        targetLocationRef.current = null;
      }
      updateDistance();
    }
  }, [challenges, challengeIndex, updateDistance]);

  const handleChallengeComplete = (correct) => {
    if (correct) {
      setChallengeIndex(prevIndex => prevIndex + 1);
    }
  };

  return (
    <div className="path-page">
      <main className="path-content">
        <h1 className={`path-title ${textVisible ? 'visible' : ''}`}>{pathName}</h1>
        <p className="distance-notice" ref={distanceNoticeRef} style={{ display: 'none' }}>
          Distance to target: <span id="distanceToTarget" ref={distanceElementRef}></span> <span id="distanceToTargetUnit"></span>
        </p>
        {currentChallengeRef.current && (
          <Challenge
            challenge={currentChallengeRef.current}
            onComplete={handleChallengeComplete}
            userLocation={getCurrentLocation()}
          />
        )}
      </main>
      <SpiritGuide isSmall={isSpiritGuideSmallRef.current} distance={distanceRef.current} />
    </div>
  );
}

export default PathPage;