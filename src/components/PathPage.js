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
import { handleError } from '../utils/utils.js';
import { useLocationWatcher } from '../hooks/locationWatcher';
import TextToSpeech from './TextToSpeech';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import { saveHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils';
import { playAudio } from '../utils/audioFeedback';

function PathPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false });
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
  const [isLocationReached, setIsLocationReached] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const userLocation = useLocationWatcher();

  const currentChallenge = challenges[challengeIndex];

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



  const updateDistanceAndCheckLocation = useCallback(() => {
    if (currentChallenge?.targetLocation && userLocation && !completedChallenges.has(challengeIndex)) {
      const newDistanceInfo = updateDistance(currentChallenge, userLocation);
      setDistanceInfo(newDistanceInfo);

      const { isReached } = checkLocationReached(currentChallenge, userLocation);
      if (isReached && !isLocationReached) {
        setIsLocationReached(true);
        setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
        displayFeedback(true, currentChallenge.completionFeedback || 'You have reached the destination!');
        playAudio('locationReached').catch(error => console.error('Error playing location reached audio:', error));
      }
    }
  }, [currentChallenge, userLocation, isLocationReached]);

  useEffect(() => {
    if (currentChallenge && userLocation && !isLocationReached) {
      updateDistanceAndCheckLocation();
    }
  }, [currentChallenge, userLocation, updateDistanceAndCheckLocation]);

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
  }, [challengeIndex, challenges, currentChallenge]);

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

  const handleStateChange = useCallback((updates) => {
    setChallengeState(prevState => updateChallengeState(currentChallenge, prevState, updates));
  }, [currentChallenge]);

  const handleSubmitClick = () => {
    const newState = handleSubmit(currentChallenge, challengeState);
    setChallengeState(newState);
    if (newState.isCorrect) {
      setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
      playAudio('correct').catch(error => console.error('Error playing correct audio:', error));
    } else {
      playAudio('wrong').catch(error => console.error('Error playing wrong audio:', error));
    }
    displayFeedback(newState.isCorrect, newState.feedback);
  };

  const handleContinueClick = useCallback(() => {
    setIsModalOpen(false);
    setModalContent({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false });

    // Mark the current challenge as completed
    setCompletedChallenges(prev => new Set(prev).add(challengeIndex));

    setTimeout(() => {
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);
      setIsLocationReached(false);
      setChallengeState(initializeChallengeState());

      const nextIndex = challengeIndex + 1;
      if (nextIndex < challenges.length) {
        navigate(`/path/${pathId}/challenge/${nextIndex}`);
        saveHuntProgress(pathId, nextIndex);

        setTimeout(() => {
          setContentVisible(true);
          setTimeout(() => {
            setChallengeVisible(true);
            setButtonContainerVisible(true);
            // Check if the next challenge requires location tracking
            if (shouldDisplayDistanceNotice(challenges[nextIndex])) {
              setDistanceNoticeVisible(true);
              updateDistanceAndCheckLocation();
            } else {
              setDistanceNoticeVisible(false);
            }
          }, 300);
        }, 100);
      } else {
        clearHuntProgress();
        navigate('/congratulations');
      }
    }, 300);
  }, [challengeIndex, challenges.length, navigate, pathId]);

  // Reset completedChallenges when changing paths
  useEffect(() => {
    setCompletedChallenges(new Set());
  }, [pathId]);

  const showHintModal = () => {
    if (currentChallenge && currentChallenge.hints && currentChallenge.hints.length > 0) {
      const totalHints = currentChallenge.hints.length;
      const nextHint = (currentHint + 1) % totalHints;
      setCurrentHint(nextHint);
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
        type: 'hint',
        showTextToSpeech: true
      });
    }
  };

  const updateModalContent = (newContent) => {
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
        saveHuntProgress(pathId, nextIndex);
        setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
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

    updateModalContent({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      content: <p className={isCorrect ? 'completion-feedback' : ''}>{contentText}</p>,
      buttons: buttons,
      type: isCorrect ? 'correct' : 'incorrect',
      showTextToSpeech: true
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
        showTextToSpeech={modalContent.showTextToSpeech}
      />
      {showCongratulations && (
        <Congratulations onClose={handleCloseCongratulations} />
      )}
    </div>
  );
}

export default PathPage;