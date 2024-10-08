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
    let distanceInMiles;
  
    if (unit === 'ft') {
      distanceInMiles = feetToMeters(distance) / 1609.34; // Convert feet to meters, then to miles
    } else if (unit === 'm') {
      distanceInMiles = distance / 1609.34; // Convert meters to miles
    } else if (unit === 'km') {
      distanceInMiles = kilometersToMiles(distance); // Convert kilometers to miles
    } else {
      distanceInMiles = distance; // Assume distance is already in miles
    }
  
    if (distanceInMiles === null) return 9000; // Default to 9 seconds if distance is unknown
    if (distanceInMiles <= 0.1) return 2000; // 2 seconds when very close (less than 0.1 miles)
    if (distanceInMiles <= 0.5) return 3000; // 3 seconds when close (between 0.1 and 0.5 miles)
    if (distanceInMiles <= 1) return 5000; // 5 seconds when between 0.5 and 1 mile
    return 7000; // 7 seconds when more than 1 mile away
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
      setDistanceInfo(newDistanceInfo);
      console.warn("Distance info:", newDistanceInfo);
  
      if (newDistanceInfo.distance !== null && newDistanceInfo.distance <= currentChallenge.radius) {
        displayFeedback(true, currentChallenge.completionFeedback || 'You have reached the destination!');
        clearTimeout(distanceIntervalRef.current);
      } else {
        const nextInterval = getRefreshInterval(newDistanceInfo);
        console.log("nextInterval:", nextInterval, " distance:", newDistanceInfo.distance);
        clearTimeout(distanceIntervalRef.current); // Clear any existing timeout
        distanceIntervalRef.current = setTimeout(updateDistanceAndCheckLocation, nextInterval);
      }
    }
  }, [currentChallenge, getRefreshInterval]);

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
    console.log("Displaying feedback:", isCorrect, feedbackText);
    const buttons = [];
    if (isCorrect) {
      buttons.push({ label: 'Continue', onClick: handleContinueClick, className: 'continue-button' });
    } else if (currentChallenge.repeatable) {
      buttons.push({ label: 'Close', onClick: () => setIsModalOpen(false), className: 'close-button' });
    } else {
      buttons.push({ label: 'Continue', onClick: handleContinueClick, className: 'continue-button' });
    }

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

    console.log("Feedback content:", contentText);
    updateModalContent({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      content: <p className={isCorrect ? 'completion-feedback' : ''}>{contentText}</p>,
      buttons: buttons,
      type: isCorrect ? 'correct' : 'incorrect'
    });
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