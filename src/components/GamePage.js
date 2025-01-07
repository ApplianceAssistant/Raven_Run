import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Challenge } from './Challenge.js';
import Compass from './Compass.js';
import Modal from './Modal.js';
import SkipCountdown from './SkipCountdown.js';
import Congratulations from './Congratulations.js';
import { useSettings } from '../utils/SettingsContext.js';
import {
  getChallenges,
  getGameTitle,
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
import { getDownloadedGame, saveDownloadedGame } from '../utils/localStorageUtils.js';
import { saveHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils.js';
import { playAudio } from '../utils/audioFeedback.js';
import { loadGame } from '../features/gameplay/services/gameplayService.js';

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
  const [originalChallenges, setOriginalChallenges] = useState([]);
  const [sortedToOriginalMap, setSortedToOriginalMap] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
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
    const loadGameData = async () => {
      try {
        const game = await loadGame(gameId);
        if (!game) {
          console.error('Game not found:', gameId);
          navigate('/lobby');
          return;
        }

        // Store original challenges
        const origChallenges = game.challenges || [];
        console.log("Original challenges:", origChallenges);
        setOriginalChallenges(origChallenges);

        // Create sorted challenges and mapping
        const sortedIndices = origChallenges.map((_, index) => index)
          .sort((a, b) => {
            // Convert order to number, using parseInt to handle string values
            const orderA = origChallenges[a].order !== undefined ? parseInt(origChallenges[a].order, 10) : Number.MAX_SAFE_INTEGER;
            const orderB = origChallenges[b].order !== undefined ? parseInt(origChallenges[b].order, 10) : Number.MAX_SAFE_INTEGER;
            console.log(`Comparing orders: ${orderA} (${typeof orderA}) vs ${orderB} (${typeof orderB})`);
            return orderA - orderB;
          });

        // Create mapping from sorted position to original index
        setSortedToOriginalMap(sortedIndices);

        // Sort challenges using the indices
        const sortedChallenges = sortedIndices.map(i => origChallenges[i]);
        console.warn("Sorted challenges:", sortedChallenges);
        setChallenges(sortedChallenges);
        setGameName(game.title || '');

        // Find sorted index for the URL challenge index
        const sortedIndex = sortedIndices.indexOf(parseInt(urlChallengeIndex, 10) || 0);
        setChallengeIndex(sortedIndex >= 0 ? sortedIndex : 0);

        // Save progress with original index
        saveHuntProgress(gameId, urlChallengeIndex);
      } catch (error) {
        console.error('Error loading game:', error);
        navigate('/lobby');
      }
    };

    loadGameData();
  }, [gameId, urlChallengeIndex, navigate]);

  const getOriginalIndex = useCallback((sortedIndex) => {
    return sortedToOriginalMap[sortedIndex];
  }, [sortedToOriginalMap]);

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
          // Trigger auto-play for TextToSpeech
          setAutoPlayTrigger(prev => prev + 1);
        }, 300); // Delay challenge visibility
      }, 100); // Delay to trigger transition

      if (shouldDisplayDistanceNotice(currentChallenge)) {
        updateDistanceAndCheckLocation();
      }
    }
  }, [challengeIndex, challenges, currentChallenge]);

  useEffect(() => {
    const checkDistanceNoticeVisibility = () => {
      const shouldBeVisible = currentChallenge && currentChallenge.targetLocation && currentChallenge.targetLocation.latitude && currentChallenge.targetLocation.longitude;
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
    setModalContent({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false, speak: '' });

    setCompletedChallenges(prev => new Set(prev).add(challengeIndex));

    setTimeout(() => {
      setContentVisible(false);
      setChallengeVisible(false);
      setButtonContainerVisible(false);
      setIsLocationReached(false);
      setChallengeState(initializeChallengeState());

      const nextSortedIndex = challengeIndex + 1;
      if (nextSortedIndex < challenges.length) {
        const nextOriginalIndex = getOriginalIndex(nextSortedIndex);
        navigate(`/game/${gameId}/challenge/${nextOriginalIndex}`);
        saveHuntProgress(gameId, nextOriginalIndex);

        setTimeout(() => {
          setContentVisible(true);
          setTimeout(() => {
            setChallengeVisible(true);
            setButtonContainerVisible(true);
            if (shouldDisplayDistanceNotice(challenges[nextSortedIndex])) {
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
  }, [challengeIndex, challenges.length, navigate, gameId, getOriginalIndex]);

  const handleSkipClick = () => {
    setContentVisible(false);
    setChallengeVisible(false);
    setTimeout(() => {
      const nextSortedIndex = challengeIndex + 1;
      if (nextSortedIndex < challenges.length) {
        const nextOriginalIndex = getOriginalIndex(nextSortedIndex);
        navigate(`/game/${gameId}/challenge/${nextOriginalIndex}`);
        saveHuntProgress(gameId, nextOriginalIndex);
        setCompletedChallenges(prev => new Set(prev).add(challengeIndex));
      } else {
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
    console.warn("newContent: ", newContent);
    setIsModalOpen(false);
    setTimeout(() => {
      setModalContent(newContent);
      setModalKey(prevKey => prevKey + 1);  // Force re-render of Modal
      setIsModalOpen(true);
    }, 300); // Adjust this delay as needed to match your modal transition duration
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
      showTextToSpeech: true,
      speak: contentText
    });
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
            Distance: <span id="distanceToTarget">{distanceInfo.displayValue}</span>{' '}
            <span id="distanceToTargetUnit">{distanceInfo.unit}</span>
            <Compass direction={distanceInfo.direction} />
          </>
        )}
      </div>
        <div className={`game-page ${contentVisible ? 'content-visible' : ''}`}>
          <main className="game-content content flex-top">
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