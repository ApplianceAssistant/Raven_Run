import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Challenge } from './Challenge';
import Compass from './Compass';
import Modal from './Modal';
import SkipCountdown from './SkipCountdown';
import Congratulations from './Congratulations';
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
  shouldDisplayDistanceNotice,
  checkLocationReached
} from '../services/challengeService.ts';
import { getCurrentLocation, getUserUnitPreference } from '../utils/utils.js';
import TextToSpeech from './TextToSpeech';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import { saveHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils';
import { metersToFeet, feetToMeters, kilometersToMiles, milesToKilometers } from '../utils/unitConversion';

function PathPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [], type: '' });
  const [modalKey, setModalKey] = useState(0);
  const [currentHint, setCurrentHint] = useState(0);
  const { pathId, challengeIndex: urlChallengeIndex } = useParams();
  const [pathName, setPathName] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(parseInt(urlChallengeIndex, 10) || 0);
  const [challengeState, setChallengeState] = useState(initializeChallengeState());
  const [contentVisible, setContentVisible] = useState(false);
  const [challengeVisible, setChallengeVisible] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({ distance: null, displayValue: '', unit: '', direction: '' });
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);
  const [distanceNoticeVisible, setDistanceNoticeVisible] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const navigate = useNavigate();

  const distanceIntervalRef = useRef(null);

  const getRefreshInterval = useCallback((newDistanceInfo) => {
    const { distance, unit } = newDistanceInfo;
    const isMetric = getUserUnitPreference();
    let distanceInMeters;

    if (unit === 'ft') {
      distanceInMeters = feetToMeters(distance);
    } else if (unit === 'm') {
      distanceInMeters = distance;
    } else if (unit === 'km') {
      distanceInMeters = milesToKilometers(distance) * 1000;
    } else {
      distanceInMeters = milesToKilometers(distance) * 1000;
    }

    if (distanceInMeters === null) return 9000; // Default to 9 seconds if distance is unknown
    if (distanceInMeters <= 50) return 2000; // 2 seconds when very close (less than 50 meters)
    if (distanceInMeters <= 500) return 3000; // 3 seconds when close (between 50 and 500 meters)
    if (distanceInMeters <= 1000) return 5000; // 5 seconds when between 500 and 1000 meters
    return 7000; // 7 seconds when more than 1000 meters away
  }, []);

  useEffect(() => {
    const loadPath = () => {
      const numericPathId = parseInt(pathId, 10);
      let fetchedChallenges = getChallenges(numericPathId);
      let pathName = getPathName(numericPathId);
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
    setChallengeIndex(parseInt(urlChallengeIndex, 10) || 0);

    // Save progress when component mounts
    saveHuntProgress(pathId, urlChallengeIndex);
  }, [pathId, urlChallengeIndex]);

  const currentChallenge = challenges[challengeIndex];

  const updateDistanceAndCheckLocation = useCallback(() => {
    if (currentChallenge && currentChallenge.targetLocation) {
      const newDistanceInfo = updateDistance(currentChallenge);
      const isMetric = getUserUnitPreference();

      // Convert distance to appropriate units for display
      let displayDistance = newDistanceInfo.distance;
      let displayUnit = newDistanceInfo.unit;

      if (!isMetric) {
        if (newDistanceInfo.unit === 'mi' && newDistanceInfo.distance < 0.1) {
          displayDistance = metersToFeet(milesToKilometers(newDistanceInfo.distance) * 1000);
          displayUnit = 'ft';
        }
      } else {
        if (newDistanceInfo.unit === 'km' && newDistanceInfo.distance < 1) {
          displayDistance = newDistanceInfo.distance * 1000;
          displayUnit = 'm';
        }
      }

      setDistanceInfo({
        ...newDistanceInfo,
        displayValue: displayDistance.toFixed(2),
        unit: displayUnit
      });

      const locationReached = checkLocationReached(currentChallenge, newDistanceInfo.distance);
      if (locationReached && !challengeState.isCorrect) {
        displayFeedback(true, currentChallenge.completionFeedback || 'You have reached the destination!');
      }

      const nextInterval = getRefreshInterval(newDistanceInfo);
      clearTimeout(distanceIntervalRef.current);
      distanceIntervalRef.current = setTimeout(updateDistanceAndCheckLocation, nextInterval);
    }
  }, [currentChallenge, getRefreshInterval, challengeState.isCorrect]);

  useEffect(() => {
    if (challenges.length > 0) {
      const initialState = initializeChallengeState();
      setChallengeState(initialState);
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

      if (shouldDisplayDistanceNotice(currentChallenge)) {
        updateDistanceAndCheckLocation();
      }
    }

    return () => {
      if (distanceIntervalRef.current) {
        clearTimeout(distanceIntervalRef.current);
      }
    };
  }, [challengeIndex, challenges, currentChallenge, updateDistanceAndCheckLocation]);

  useEffect(() => {
    const checkDistanceNoticeVisibility = () => {
      const shouldBeVisible = currentChallenge && currentChallenge.targetLocation;
      setDistanceNoticeVisible(shouldBeVisible);
    };

    checkDistanceNoticeVisibility();

    // Check visibility when the tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDistanceNoticeVisibility();
        if (distanceNoticeVisible) {
          updateDistanceAndCheckLocation();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentChallenge, distanceNoticeVisible, updateDistanceAndCheckLocation]);

  const handleStateChange = (updates) => {
    setChallengeState(prevState => updateChallengeState(currentChallenge, prevState, updates));
  };

  const handleSubmitClick = () => {
    const newState = handleSubmit(currentChallenge, challengeState);
    setChallengeState(newState);
    console.log("Submit result:", newState);
    displayFeedback(newState.isCorrect, newState.feedback);
  };

  const handleContinueClick = () => {
    setIsModalOpen(false);
    setContentVisible(false);
    setChallengeVisible(false);
    setTimeout(() => {
      const nextIndex = challengeIndex + 1;
      if (nextIndex < challenges.length) {
        navigate(`/path/${pathId}/challenge/${nextIndex}`);
        saveHuntProgress(pathId, nextIndex);
      } else {
        // Navigate to Congratulations page
        clearHuntProgress();
        navigate('/congratulations');
      }
    }, 500);
  };

  const showHintModal = () => {
    if (currentChallenge && currentChallenge.hints && currentChallenge.hints.length > 0) {
      const totalHints = currentChallenge.hints.length;
      const nextHint = (currentHint + 1) % totalHints;
      setCurrentHint(nextHint);
      console.log("Showing hint:", currentHint, currentChallenge.hints[nextHint]);
      updateModalContent({
        title: 'Hint',
        content: (
          <>
            <p>{currentChallenge.hints[currentHint]}</p>
            {totalHints > 1 && (
              <p className="hint-counter">Hint {currentHint + 1} of {totalHints}</p>
            )}
          </>
        ),
        buttons: [
          { label: 'Close', onClick: () => setIsModalOpen(false) }],
        type: 'hint'
      });
    }
  };

  const updateModalContent = (newContent) => {
    console.warn("Updating modal content:", newContent);
    setIsModalOpen(false);
    setTimeout(() => {
      setModalContent(newContent);
      setModalKey(prevKey => prevKey + 1);  // Force re-render of Modal
      setIsModalOpen(true);
    }, 300); // Adjust this delay as needed to match your modal transition duration
  };

  const handleSkipClick = () => {
    setContentVisible(false);
    setChallengeVisible(false);
    setTimeout(() => {
      const nextIndex = challengeIndex + 1;
      if (nextIndex < challenges.length) {
        setChallengeIndex(nextIndex);
      } else {
        // Navigate to Congratulations page
        clearHuntProgress();
        navigate('/congratulations');
      }
    }, 500);
  };

  const handleCloseCongratulations = () => {
    setShowCongratulations(false);
    navigate('/lobby');
  };

  const displayFeedback = (isCorrect, feedbackText) => {
    if (challengeState.isCorrect) return; // Prevent multiple displays of completion feedback

    let contentText = feedbackText;
    if (isCorrect) {
      if (currentChallenge.feedbackTexts && currentChallenge.feedbackTexts.correct) {
        contentText = currentChallenge.feedbackTexts.correct;
      } else if (currentChallenge.completionFeedback && currentChallenge.completionFeedback.trim() !== '') {
        contentText = currentChallenge.completionFeedback;
      } else {
        contentText = feedbackText || 'Correct! Well done!';
      }
    } else if (currentChallenge.feedbackTexts && currentChallenge.feedbackTexts.incorrect) {
      const incorrectFeedbacks = currentChallenge.feedbackTexts.incorrect;
      const feedbackIndex = Math.min(challengeState.attempts - 1, incorrectFeedbacks.length - 1);
      contentText = incorrectFeedbacks[feedbackIndex] || feedbackText || 'Incorrect. Try again!';
    }

    const buttons = [];

    if (isCorrect || !currentChallenge.repeatable) {
      buttons.push({ label: 'Continue', onClick: handleContinueClick, className: 'continue-button' });
    } else {
      buttons.push({ label: 'Close', onClick: () => setIsModalOpen(false), className: 'close-button' });
    }

    updateModalContent({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      content: <p className={isCorrect ? 'completion-feedback' : ''}>{contentText}</p>,
      buttons: buttons,
      type: isCorrect ? 'correct' : 'incorrect'
    });

    setChallengeState(prevState => ({
      ...prevState,
      isCorrect: isCorrect
    }));
  };

  const renderButtons = () => {
    if (!currentChallenge) return null;
    return (
      <div className={`button-container-bottom visible`}>
        {(currentChallenge.description || currentChallenge.storyText) &&
          <TextToSpeech text={currentChallenge.description || currentChallenge.storyText} />
        }
        {canDisplayHints(currentChallenge) && !challengeState.isCorrect && (
          <button onClick={showHintModal} className="hint-button">Hint</button>
        )}
        {shouldDisplaySubmitButton(currentChallenge, challengeState) && (
          <button onClick={handleSubmitClick} className="submit-button">Submit</button>
        )}
        {shouldDisplaySkipButton(currentChallenge, challengeState) ? (
          <button onClick={handleSkipClick}>Skip</button>
        ) : (
          <SkipCountdown challengeState={challengeState} />
        )}
        <button onClick={handleSkipClick}>Skip</button>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className={`distance-notice ${contentVisible && distanceNoticeVisible ? 'visible' : ''}`}>
        {distanceNoticeVisible && (
          <>
            Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span>{' '}
            <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
            <Compass direction={distanceInfo.direction} />
          </>
        )}
      </div>

      <div className="spirit-guide large">
        <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
          <main className="path-content content flex-top">
            <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
              {currentChallenge && (
                <Challenge
                  key={challengeIndex}
                  challenge={currentChallenge}
                  challengeState={{ ...challengeState, textVisible: challengeVisible }}
                  onStateChange={handleStateChange}
                  userLocation={getCurrentLocation()}
                  onContinue={handleContinueClick}
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
        type={modalContent.type}
      />
      {showCongratulations && (
        <Congratulations onClose={handleCloseCongratulations} />
      )}
    </div>
  );
}

export default PathPage;