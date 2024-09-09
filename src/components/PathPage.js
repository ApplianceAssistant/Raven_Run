import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SpiritGuide from './SpiritGuide';
import { Challenge } from './Challenge';
import { getChallenges, getPathName, resetFeedbackCycle } from '../services/challengeService.ts';
import ScrollableContent from './ScrollableContent';
import { calculateDistance, getCurrentLocation, addLocationListener, removeLocationListener } from '../utils/utils.js';

function PathPage() {
  const { pathId } = useParams();
  const [pathName, setPathName] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(-1);
  const [contentVisible, setContentVisible] = useState(true);
  const [challengeVisible, setChallengeVisible] = useState(false);
  const [isSpiritGuideSmall, setIsSpiritGuideSmall] = useState(false);
  const [isFirstChallenge, setIsFirstChallenge] = useState(true);
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

    //loading the first challenge
    setChallengeIndex(0);

    return () => {
      removeLocationListener(updateDistance);
    };
  }, [pathId, updateDistance]);

  useEffect(() => {
    if (challengeIndex >= 0 && challenges.length > 0) {
      const challenge = challenges[challengeIndex];
      console.log("challenge: ", challenge);
      if (!challenge) {
        //they have finnished the path.
        //display a message in the and return to the home page
        alert("Congratulations! You have completed the path.");
        window.location.href = '/';
        return;
      }
      resetFeedbackCycle(challenge.id);
      if (challenge.targetLocation) {
        targetLocationRef.current = challenge.targetLocation;
      } else {
        targetLocationRef.current = null;
      }
      updateDistance();

      if (isFirstChallenge) {
        // Trigger spirit guide transition
        setIsSpiritGuideSmall(true);
        setTimeout(() => {
          setChallengeVisible(true);
        }, 500); // Show challenge after spirit guide starts transitioning
      } else {
        setChallengeVisible(true);
      }
    }
  }, [challenges, challengeIndex, isFirstChallenge, updateDistance]);

  const handleChallengeComplete = useCallback((correct) => {
    if (correct) {
      setChallengeVisible(false); // Start fade-out
      setTimeout(() => {
        setChallengeIndex(prevIndex => prevIndex + 1);
        setIsFirstChallenge(false);
        setTimeout(() => {
          setChallengeVisible(true); // Start fade-in for new challenge
        }, 50);
      }, 500); // Wait for fade-out to complete
    }
  }, []);

  const currentChallenge = challenges[challengeIndex];

  return (
    <div className="content-wrapper">
      <SpiritGuide
        isSmall={isSpiritGuideSmall}
        distance={distance}
        isFirstTransition={isFirstChallenge && isSpiritGuideSmall}
      />
      <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
        <main className="path-content">
          <p className="distance-notice" style={{ display: 'none' }}>
            Distance: <span id="distanceToTarget"></span> <span id="distanceToTargetUnit"></span>
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
      </div>
    </div>
  );
}

export default PathPage;