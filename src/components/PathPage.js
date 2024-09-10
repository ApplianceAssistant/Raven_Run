import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Challenge } from './Challenge';
import {
  getChallenges,
  getPathName,
  initializeChallengeState,
  updateChallengeState,
  shouldDisplaySubmitButton,
  shouldDisplayContinueButton,
  handleSubmit,
  getNextHintState,
  canDisplayHints,
  canDisplayDistance
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
      setTimeout(() => {
        setContentVisible(true);
        setTimeout(() => {
          setChallengeVisible(true);
        }, 300); // Delay challenge visibility
      }, 100); // Delay to trigger transition
    }
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

  const renderButtons = () => {
    if (!currentChallenge) return null;
    
    return (
      <div className="button-container-bottom">
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
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <p className={`distance-notice ${contentVisible ? 'visible' : ''}`} 
         style={{ display: currentChallenge && canDisplayDistance(currentChallenge) ? 'block' : 'none' }}>
        Distance: <span id="distanceToTarget"></span> <span id="distanceToTargetUnit"></span>
      </p>

      <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
        <div className="spirit-guide large">
          <main className="path-content content">
            <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
              {currentChallenge && (
                <Challenge
                  key={challengeIndex}
                  challenge={currentChallenge}
                  challengeState={{...challengeState, textVisible: challengeVisible}}
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