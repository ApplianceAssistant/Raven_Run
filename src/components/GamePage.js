import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faForward } from '@fortawesome/free-solid-svg-icons';
import { Challenge } from './Challenge.js';
import Compass from './Compass.js';
import Modal from './Modal.js';
import SkipCountdown from './SkipCountdown.js';
import Congratulations from './Congratulations.js';
import { useSettings } from '../utils/SettingsContext.js';
import {
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
import { useLocationWatcher } from '../hooks/locationWatcher.js';
import TextToSpeech from './TextToSpeech.js';
import { saveHuntProgress, clearHuntProgress, getHuntProgress } from '../utils/huntProgressUtils.js';
import { playAudio } from '../utils/audioFeedback.js';
import { loadGame } from '../features/gameplay/services/gameplayService.js';
import { handlePlaytestQuit } from '../features/gameCreation/services/gameCreatorService.js';
import { getPlaytestState } from '../utils/localStorageUtils.js';
import'../css/Challenge.scss';

function GamePage() {
  const [autoPlayTrigger, setAutoPlayTrigger] = useState(0);
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false, speak: '' });
  const [modalKey, setModalKey] = useState(0);
  const [currentHint, setCurrentHint] = useState(0);
  const { gameId, challengeIndex: urlChallengeIndex } = useParams();
  const [gameName, setGameName] = useState('');
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
  const { userLocation, hasLocationError } = useLocationWatcher();

  const currentChallenge = challenges[challengeIndex];

  const isPlaytestMode = useMemo(() => {
    const playtestState = getPlaytestState();
    return playtestState?.gameId === gameId;
  }, [gameId]);

  const updateDistanceAndCheckLocation = useCallback(() => {
    if (currentChallenge?.targetLocation && userLocation && !completedChallenges.has(challengeIndex)) {
      const newDistanceInfo = updateDistance(currentChallenge, userLocation);
      setDistanceInfo(newDistanceInfo);

      const { isReached } = checkLocationReached(currentChallenge, userLocation);
      if (isReached && !isLocationReached) {
        setIsLocationReached(true);
        setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
        
        setChallengeState(prev => ({
          ...prev,
          isLocationReached: true
        }));
        
        displayFeedback(true, currentChallenge.completionFeedback || 'You have reached the destination!');
        playAudio('locationReached').catch(error => console.error('Error playing location reached audio:', error));
      }
    }
  }, [currentChallenge, userLocation, challengeIndex, isLocationReached, completedChallenges]);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Load game from downloaded games or download it
        const gameData = await loadGame(gameId);
        if (!gameData) {
          console.error('Game not found:', gameId);
          navigate('/lobby');
          return;
        }

        // Get progress
        const progress = getHuntProgress();
        const requestedIndex = parseInt(urlChallengeIndex, 10) || 0;

        // In playtest mode, bypass progress checks
        if (!isPlaytestMode && progress?.gameId === gameId && requestedIndex > progress.challengeIndex) {
          console.warn('Attempted to skip ahead. Redirecting to last saved challenge:', progress.challengeIndex);
          navigate(`/game/${gameId}/challenge/${progress.challengeIndex}`);
          return;
        }

        // Check hunt progress to prevent skipping ahead
        if (progress && progress.gameId === gameId) {
          // If trying to access a future challenge, redirect to the last saved challenge
          if (requestedIndex > progress.challengeIndex) {
            console.warn('Attempted to skip ahead. Redirecting to last saved challenge:', progress.challengeIndex);
            navigate(`/game/${gameId}/challenge/${progress.challengeIndex}`);
            return;
          }
        }

        // Set game data
        setChallenges(gameData.challenges || []);
        setGameName(gameData.title || '');
      } catch (error) {
        console.error('Error loading game:', error);
        navigate('/lobby');
      }
    };

    loadGameData();
    setChallengeIndex(parseInt(urlChallengeIndex, 10) || 0);
  }, [gameId, urlChallengeIndex, navigate, isPlaytestMode]);

  useEffect(() => {
    if (currentChallenge && userLocation && !isLocationReached) {
      updateDistanceAndCheckLocation();
    }
  }, [currentChallenge, userLocation, isLocationReached, updateDistanceAndCheckLocation]);

  useEffect(() => {
    if (challenges.length > 0) {
      const initialState = initializeChallengeState();
      setChallengeState(initialState);
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);
      setIsLocationReached(false);
      
      setTimeout(() => {
        setContentVisible(true);
        setTimeout(() => {
          setChallengeVisible(true);
          setButtonContainerVisible(true);
          setAutoPlayTrigger(prev => prev + 1);
        }, 300);
      }, 100);
    }
  }, [challengeIndex, challenges]);

  useEffect(() => {
    if (currentChallenge && userLocation && !isLocationReached) {
      updateDistanceAndCheckLocation();
    }
  }, [currentChallenge, userLocation, isLocationReached, updateDistanceAndCheckLocation]);

  useEffect(() => {
    if (currentChallenge) {
      const shouldBeVisible = shouldDisplayDistanceNotice(currentChallenge) && !isLocationReached;
      setDistanceNoticeVisible(shouldBeVisible);
    }
  }, [currentChallenge, isLocationReached]);

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
    setModalContent({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false, speak: '' });

    // Mark the current challenge as completed
    setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
    saveHuntProgress(gameId, challengeIndex + 1);
    setTimeout(() => {
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);
      setIsLocationReached(false);
      setChallengeState(initializeChallengeState());

      const nextIndex = challengeIndex + 1;
      if (nextIndex < challenges.length) {
        navigate(`/game/${gameId}/challenge/${nextIndex}`);

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
  }, [challengeIndex, challenges.length, navigate, gameId]);

  const handlePlaytestNext = () => {
    const nextIndex = challengeIndex + 1;
    setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
    
    if (nextIndex < challenges.length) {
      setChallengeIndex(nextIndex);
      
      // Update progress for playtest mode
      if (isPlaytestMode) {
        saveHuntProgress(gameId, nextIndex);
      }
      
      // Use the correct URL path
      navigate(`/game/${gameId}/challenge/${nextIndex}`, { replace: true });
      
      // Reset challenge state
      setCurrentHint(0);
      setChallengeState(initializeChallengeState());
      setContentVisible(true);
      setChallengeVisible(false);
      setAutoPlayTrigger(prev => prev + 1);
    } else {
      // Clear hunt progress and navigate to congratulations
      clearHuntProgress();
      navigate('/congratulations', { state: { fromGame: gameId } });
    }
  };

  // Reset completedChallenges when changing games
  useEffect(() => {
    setCompletedChallenges(new Set());
  }, [gameId]);

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
        showTextToSpeech: true,
        speak: currentChallenge.hints[currentHint]
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
        saveHuntProgress(gameId, nextIndex);
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
    } else {
      buttons.push({ label: 'Close', onClick: () => setIsModalOpen(false), className: 'close-button' });
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
      content: <p className={isCorrect ? 'completion-feedback' : ''}>{contentText}</p>,
      buttons: buttons,
      type: isCorrect ? 'correct' : 'incorrect',
      showTextToSpeech: true,
      speak: contentText
    });
  };

  const handleBackToEditor = () => {
    handlePlaytestQuit(gameId, navigate);
  };

  const renderButtons = () => {
    if (!currentChallenge) return null;

    const getTextToSpeak = () => {
      let text = currentChallenge.description || currentChallenge.storyText || '';
      if (currentChallenge.question) {
        text = text ? `${text}. ${currentChallenge.question}` : currentChallenge.question;
      }
      return text;
    };

    // Create a state object that includes the current visibility state
    const stateWithVisibility = {
      ...challengeState,
      textVisible: challengeVisible
    };

    return (
      <div className={`button-container-bottom visible`}>
        {isPlaytestMode && (
          <div className="playtest-controls">
            <button
              className="quit-playtest"
              onClick={handleBackToEditor}
              title="Return to Game Editor"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              className="playtest-next"
              onClick={handlePlaytestNext}
              title="Skip to Next Challenge"
            >
              <FontAwesomeIcon icon={faForward} />
            </button>
          </div>
        )}
        {(currentChallenge.description || currentChallenge.storyText || currentChallenge.question) &&
          <TextToSpeech 
            text={getTextToSpeak()}
            autoPlayTrigger={autoPlayTrigger}
          />
        }
        {canDisplayHints(currentChallenge) && !challengeState.isCorrect && (
          <button onClick={showHintModal} className="hint-button">Hint</button>
        )}
        {shouldDisplaySubmitButton(currentChallenge, stateWithVisibility) && (
          <button onClick={handleSubmitClick} className="submit-button">Submit</button>
        )}
        {shouldDisplayContinueButton(currentChallenge, stateWithVisibility) ? (
          <button onClick={handleContinueClick} className="continue-button">Continue</button>
        ) : shouldDisplaySkipButton(currentChallenge, stateWithVisibility) ? (
          <button onClick={handleSkipClick}>Skip</button>
        ) : (
          <SkipCountdown 
            challengeState={stateWithVisibility}
            onCountdownComplete={() => setChallengeState(prev => ({
              ...prev,
              startTime: prev.startTime - (5 * 60 * 1000) // Subtract 5 minutes to force skip button display
            }))}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className={`distance-notice ${contentVisible && distanceNoticeVisible ? 'visible' : ''}`}>
        {distanceNoticeVisible && (
          <>
            {hasLocationError ? (
              <div className="error-message">
                Please enable location services to continue.
              </div>
            ) : (
              <>
                Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span>{' '}
                <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
                <Compass direction={distanceInfo.direction} />
              </>
            )}
          </>
        )}
      </div>
        <div className={`${contentVisible ? 'visible' : ''}`}>
          <main>
            <div className={`challenge-wrapper ${challengeVisible ? 'visible' : ''}`}>
            {currentChallenge && (
          <>

            <Challenge
              key={challengeIndex}
              challenge={currentChallenge}
              challengeState={{ ...challengeState, textVisible: challengeVisible }}
              onStateChange={handleStateChange}
              onContinue={handleContinueClick}
            />
          </>

        )}
            </div>
          </main>
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
        speak={modalContent.speak}
      />
      {showCongratulations && (
        <Congratulations onClose={handleCloseCongratulations} />
      )}
    </>
  );
}

export default GamePage;