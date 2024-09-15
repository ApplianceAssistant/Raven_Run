import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Challenge } from './Challenge';
import Compass from './Compass';
import Modal from './Modal';
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
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';

function PathPage() {
  // ... (existing state variables)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [] });
  const { pathId } = useParams();
  const [pathName, setPathName] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeState, setChallengeState] = useState(initializeChallengeState());
  const [contentVisible, setContentVisible] = useState(false);
  const [challengeVisible, setChallengeVisible] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({ distance: null, displayValue: '', unit: '', direction: '' });
  const distanceIntervalRef = useRef(null);
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);

  const getRefreshInterval = (distance) => {
    if (distance === null) return 15000; // Default to 15 seconds if distance is unknown
    if (distance <= 0.1) return 2000; // 2 seconds when very close (less than 0.1 miles)
    if (distance <= 0.5) return 5000; // 5 seconds when close (between 0.1 and 0.5 miles)
    if (distance <= 1) return 10000; // 10 seconds when between 0.5 and 1 mile
    return 15000; // 15 seconds when more than 1 mile away
  };

  useEffect(() => {
    const loadPath = () => {
      const numericPathId = parseInt(pathId, 10);
      let fetchedChallenges = getChallenges(numericPathId);
      let pathName = getPathName(numericPathId);
      // If not found in default paths, check custom paths
      if (!fetchedChallenges.length) {
        const customPaths = getGamesFromLocalStorage();
        const customPath = customPaths.find(path => path.id === numericPathId);
        if (customPath) {
          fetchedChallenges = customPath.challenges;
          pathName = customPath.name;
        }
      }

      setChallenges(fetchedChallenges);
      setPathName(pathName);
    };

    loadPath();
  }, [pathId]);

  useEffect(() => {
    if (challenges.length > 0) {
      const initialState = initializeChallengeState();
      setChallengeState(initialState);

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
        const updateDistanceWithDynamicInterval = () => {
          const newDistanceInfo = updateDistance(challenges[challengeIndex]);
          setDistanceInfo(newDistanceInfo);
          
          // Set up the next interval
          const nextInterval = getRefreshInterval(newDistanceInfo.distance);
          distanceIntervalRef.current = setTimeout(updateDistanceWithDynamicInterval, nextInterval);
        };

        // Initial update and interval set
        updateDistanceWithDynamicInterval();
      }
    }

    return () => {
      if (distanceIntervalRef.current) {
        clearTimeout(distanceIntervalRef.current);
      }
    };
  }, [challengeIndex, challenges]);

  const currentChallenge = challenges[challengeIndex];
  console.log("currentChallenge: ", currentChallenge);

  useEffect(() => {
    console.log('Current challenge:', currentChallenge);
    console.log('Hints:', currentChallenge?.hints);
  }, [currentChallenge]);

  useEffect(() => {
    if (isModalOpen && currentChallenge && currentChallenge.hints && currentChallenge.hints.length > 0) {
      const currentHint = challengeState.currentHint ?? 0;
      const totalHints = currentChallenge.hints.length;
      
      setModalContent({
        title: 'Hint',
        content: (
          <>
            <p>{currentChallenge.hints[currentHint]}</p>
            {totalHints > 1 && (
              <p className="hint-counter">Hint {currentHint + 1} of {totalHints}</p>
            )}
          </>
        ),
        buttons: totalHints > 1 
          ? [
              {
                label: 'Close',
                onClick: () => setIsModalOpen(false)
              },
              {
                label: 'Next Hint',
                onClick: handleGetHint
              }
            ]
          : [
              {
                label: 'Close',
                onClick: () => setIsModalOpen(false)
              }
            ]
      });
    }
  }, [isModalOpen, challengeState.currentHint, currentChallenge]);

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

  const showHintModal = () => {
    if (currentChallenge && currentChallenge.hints && currentChallenge.hints.length > 0) {
      setIsModalOpen(true);
    } else {
      console.log('No hints available or challenge not loaded');
    }
  };

  const handleGetHint = () => {
    setChallengeState(prevState => {
      const newState = getNextHintState(currentChallenge, prevState);
      return newState;
    });
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
    console.log('Can display hints:', canDisplayHints(currentChallenge));
    return (
      <div className={`button-container-bottom ${buttonContainerVisible ? 'visible' : ''}`}>
        {(currentChallenge.description || currentChallenge.storyText) &&
          <TextToSpeech text={currentChallenge.description || currentChallenge.storyText} />
        }
        {canDisplayHints(currentChallenge) && !challengeState.isCorrect && (
          <button onClick={showHintModal} className="hint-button">Hint</button>
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
      <h2 className="center">{pathName}</h2>
      {shouldDisplayDistanceNotice(currentChallenge) && (
        <p className={`distance-notice ${contentVisible ? 'visible' : ''}`}>
          Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span> <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
          <Compass direction={distanceInfo.direction} />
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        content={modalContent.content}
        buttons={modalContent.buttons}
      />
    </div>
  );
}

export default PathPage;