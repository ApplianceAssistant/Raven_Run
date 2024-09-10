import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Challenge } from './Challenge';
import {
  getChallenges,
  getPathName,
  initializeChallengeState,
  updateChallengeState,
  shouldDisplaySubmitButton,
  shouldDisplayContinueButton,
  shouldDisplaySkipButton,
  handleSubmit,
  getNextHintState,
  canDisplayHints,
  updateDistance,
  shouldDisplayDistanceNotice
} from '../services/challengeService.ts';
import { getCurrentLocation } from '../utils/utils.js';
import TextToSpeech from './TextToSpeech';

function PathPage() {
  const { pathId } = useParams();
  const [pathName, setPathName] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeState, setChallengeState] = useState(initializeChallengeState());
  const [contentVisible, setContentVisible] = useState(false);
  const [challengeVisible, setChallengeVisible] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({ distance: null, displayValue: '', unit: '' });
  const distanceIntervalRef = useRef(null);
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);

  useEffect(() => {
    const numericPathId = parseInt(pathId, 10);
    const fetchedChallenges = getChallenges(numericPathId);
    setChallenges(fetchedChallenges);
    setPathName(getPathName(numericPathId));
  }, [pathId]);

  useEffect(() => {
    if (challenges.length > 0) {
      setChallengeState(initializeChallengeState());
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);
      setTimeout(() => {
        setContentVisible(true);
        setTimeout(() => {
          setChallengeVisible(true);
          setButtonContainerVisible(true);
        }, 300); // Delay challenge visibility
      }, 100); // Delay to trigger transition

      // Clear previous interval and start new one for distance updates
      if (distanceIntervalRef.current) {
        clearInterval(distanceIntervalRef.current);
      }

      if (shouldDisplayDistanceNotice(challenges[challengeIndex])) {
        distanceIntervalRef.current = setInterval(() => {
          const newDistanceInfo = updateDistance(challenges[challengeIndex]);
          setDistanceInfo(newDistanceInfo);
        }, 2000);
      }
    }

    return () => {
      if (distanceIntervalRef.current) {
        clearInterval(distanceIntervalRef.current);
      }
    };
  }, [challengeIndex, challenges]);

  const currentChallenge = challenges[challengeIndex];

  const handleStateChange = (updates) => {
    setChallengeState(prevState => updateChallengeState(currentChallenge, prevState, updates));
  };

  const handleSubmitClick = () => {
    const newState = handleSubmit(currentChallenge, challengeState);
    setChallengeState(newState);
  };

  const handleContinueClick = () => {
    setContentVisible(false);
    setChallengeVisible(false);
    setTimeout(() => {
      setChallengeIndex(prevIndex => prevIndex + 1);
    }, 500); // Adjust time as needed for transition
  };

  const handleGetHint = () => {
    setChallengeState(prevState => getNextHintState(currentChallenge, prevState));
  };

  const handleSkipClick = () => {
    setContentVisible(false);
    setChallengeVisible(false);
    setTimeout(() => {
      setChallengeIndex(prevIndex => prevIndex + 1);
    }, 500);
  };

  const renderButtons = () => {
    if (!currentChallenge) return null;

    return (
      <div className={`button-container-bottom ${buttonContainerVisible ? 'visible' : ''}`}>
        {(currentChallenge.description || currentChallenge.storyText) &&
          <TextToSpeech text={currentChallenge.description || currentChallenge.storyText} />
        }
        {canDisplayHints(currentChallenge) && !challengeState.isCorrect && (
          <button onClick={handleGetHint} className="hint-button">Hint</button>
        )}
        {shouldDisplaySubmitButton(currentChallenge, challengeState) && (
          <button onClick={handleSubmitClick} className="submit-button">Submit</button>
        )}
        {shouldDisplayContinueButton(currentChallenge, challengeState) && (
          <button onClick={handleContinueClick} className="continue-button">Continue</button>
        )}
        {shouldDisplaySkipButton(currentChallenge, challengeState) && (
          <button onClick={handleSkipClick} className="skip-button">Skip</button>
        )}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      {shouldDisplayDistanceNotice(currentChallenge) && (
        <p className={`distance-notice ${contentVisible ? 'visible' : ''}`}>
          Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span> <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
        </p>
      )}
      <div className="spirit-guide large">
        <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
          <main className="path-content content">
            <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
              {currentChallenge && (
                <Challenge
                  key={challengeIndex}
                  challenge={currentChallenge}
                  challengeState={{ ...challengeState, textVisible: challengeVisible }}
                  onStateChange={handleStateChange}
                  userLocation={getCurrentLocation()}
                />
              )}
            </div>
          </main>
        </div>
      </div>
      {renderButtons()}
    </div>
  );
}

export default PathPage;