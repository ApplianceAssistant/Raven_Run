import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { handleError } from '../utils/utils.js';
import { useLocationWatcher } from '../hooks/locationWatcher';
import TextToSpeech from './TextToSpeech';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import { saveHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils';

// New component for distance display
const DistanceDisplay = React.memo(({ distanceInfo, visible }) => {
  if (!visible) return null;
  return (
    <div className={`distance-notice visible`}>
      Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span>{' '}
      <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
      <Compass direction={distanceInfo.direction} />
    </div>
  );
});

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
  const [isLocationReached, setIsLocationReached] = useState(false);
  const navigate = useNavigate();
  const userLocation = useLocationWatcher();

  const currentChallenge = useMemo(() => challenges[challengeIndex], [challenges, challengeIndex]);

  const updateDistanceAndCheckLocation = useCallback(() => {
    if (currentChallenge?.targetLocation && userLocation) {
      console.log("Updating distance and checking location");
      
      const newDistanceInfo = updateDistance(currentChallenge, userLocation);
      console.log("New distance info:", newDistanceInfo);

      setDistanceInfo(newDistanceInfo);

      const { isReached } = checkLocationReached(currentChallenge, userLocation);
      setIsLocationReached(isReached);

      if (isReached && !challengeState.isCorrect) {
        displayFeedback(true, currentChallenge.completionFeedback || 'You have reached the destination!');
      }
    }
  }, [currentChallenge, userLocation, challengeState.isCorrect]);

  useEffect(() => {
    if (currentChallenge?.targetLocation) {
      updateDistanceAndCheckLocation();
    }
  }, [updateDistanceAndCheckLocation, currentChallenge]);

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

  useEffect(() => {
    if (challenges.length > 0) {
      const initialState = initializeChallengeState();
      setChallengeState(initialState);
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);

      // Set up a sequence of state updates
      const setupSequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        setContentVisible(true);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setChallengeVisible(true);
        setButtonContainerVisible(true);

        // Check if we should display distance notice and update initially
        if (shouldDisplayDistanceNotice(currentChallenge)) {
          updateDistanceAndCheckLocation();
        }
      };

      setupSequence();
    }
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
        updateDistanceAndCheckLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentChallenge, updateDistanceAndCheckLocation]);

  const handleStateChange = useCallback((updates) => {
    setChallengeState(prevState => updateChallengeState(currentChallenge, prevState, updates));
  }, [currentChallenge]);

  const handleSubmitClick = () => {
    const newState = handleSubmit(currentChallenge, challengeState);
    setChallengeState(newState);
    console.log("Submit result:", newState);
    displayFeedback(newState.isCorrect, newState.feedback);
  };

  const handleContinueClick = useCallback(() => {
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
  }, [challengeIndex, challenges.length, navigate, pathId]);

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

  const memoizedChallenge = useMemo(() => {
    if (!currentChallenge) return null;
    
    return (
      <Challenge
        key={challengeIndex}
        challenge={currentChallenge}
        challengeState={{ ...challengeState, textVisible: challengeVisible }}
        onStateChange={handleStateChange}
        onContinue={handleContinueClick}
      />
    );
  }, [challengeIndex, currentChallenge, challengeState, challengeVisible, handleStateChange, handleContinueClick]);

  return (
    <div className="content-wrapper">
      <DistanceDisplay 
        distanceInfo={distanceInfo} 
        visible={contentVisible && distanceNoticeVisible} 
      />
      <div className="spirit-guide large">
        <div className={`path-page ${contentVisible ? 'content-visible' : ''}`}>
          <main className="path-content content flex-top">
            <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
              {memoizedChallenge}
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

export default React.memo(PathPage);