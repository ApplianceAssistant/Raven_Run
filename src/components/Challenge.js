import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { checkLocationReached, canDisplayDistance } from '../services/challengeService.ts';
import ScrollableContent from './ScrollableContent';

export const Challenge = ({ challenge, userLocation, challengeState, onStateChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [] });
  useEffect(() => {
    if (canDisplayDistance(challenge)) {
      checkTravelChallenge();
    }
  }, [challenge, userLocation]);

  const checkTravelChallenge = () => {
    const intervalId = setInterval(() => {
      if (checkLocationReached(challenge, userLocation)) {
        onStateChange({ isLocationReached: true });
        clearInterval(intervalId);
        if (challenge.completionFeedback) {
          onStateChange({ feedback: challenge.completionFeedback });
        }
      }
    }, 2000);

    return () => clearInterval(intervalId);
  };

  const showHintModal = () => {
    const hintIndex = challengeState.hintIndex;
    if (hintIndex < challenge.hints.length) {
      setModalContent({
        title: 'Hint',
        content: <p>{challenge.hints[hintIndex]}</p>,
        buttons: [
          {
            label: 'Close',
            onClick: () => setIsModalOpen(false)
          }
        ]
      });
      setIsModalOpen(true);
      onStateChange({ hintIndex: hintIndex + 1 });
    }
  };

  const showFeedbackModal = (isCorrect) => {
    const feedbackContent = isCorrect 
      ? challenge.feedbackTexts.correct 
      : challenge.feedbackTexts.incorrect[0];
    
    const buttons = [{ label: 'Close', onClick: () => setIsModalOpen(false) }];
    
    if (isCorrect || (!challenge.repeatable && !isCorrect)) {
      buttons.push({
        label: 'Continue',
        onClick: () => {
          setIsModalOpen(false);
          onStateChange({ shouldContinue: true });
        }
      });
    }

    setModalContent({
      title: isCorrect ? 'Correct!' : 'Incorrect',
      content: <p>{feedbackContent}</p>,
      buttons: buttons
    });
    setIsModalOpen(true);
  };

  const renderChallenge = () => {
    switch (challenge.type) {
      case 'story':
        return renderStoryChallenge();
      case 'multipleChoice':
        return renderMultipleChoiceChallenge();
      case 'trueFalse':
        return renderTrueFalseChallenge();
      case 'textInput':
        return renderTextInputChallenge();
      case 'areaSearch':
        return renderAreaSearchChallenge();
      default:
        return <p>Unknown challenge type.</p>;
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (challenge.type === 'trueFalse') {
      value = value === 'true';
    }
    onStateChange({ answer: value });
  };

  const renderStoryChallenge = () => (
    <div className="story-challenge">
      <div className="story-text">{challenge.storyText}</div>
    </div>
  );

  const renderMultipleChoiceChallenge = () => {
    if (!challenge.options || !Array.isArray(challenge.options)) {
      return <p>No options available for this challenge.</p>;
    }
    <form>
      {challenge.options.map(option => (
        <label key={option}>
          <input
            type="radio"
            value={option}
            checked={challengeState.answer === option}
            onChange={handleInputChange}
          />
          {option}
        </label>
      ))}
    </form>
  };

  const renderTrueFalseChallenge = () => (
    <form>
      <label>
        <input
          type="radio"
          value="true"
          checked={challengeState.answer === true}
          onChange={handleInputChange}
        />
        True
      </label>
      <label>
        <input
          type="radio"
          value="false"
          checked={challengeState.answer === false}
          onChange={handleInputChange}
        />
        False
      </label>
    </form>
  );

  const renderTextInputChallenge = () => (
    <form>
      <input
        type="text"
        value={challengeState.answer}
        onChange={handleInputChange}
      />
    </form>
  );

  const renderAreaSearchChallenge = () => {
    if (!challenge.clues || !Array.isArray(challenge.clues)) {
      return <p>No clues available for this challenge.</p>;
    }
  
    return (
      <div>
        {challenge.clues.map((clue, index) => (
          <p key={index} className="clue">{clue}</p>
        ))}
      </div>
    );
  };

  return (
    <div className={`challengeBody ${challengeState.textVisible ? 'visible' : ''}`}>
      <ScrollableContent maxHeight="60vh">
      <h2>{challenge.title}</h2>
      <div className="challenge-content">
        {challenge.description && <p className="challenge-description">{challenge.description}</p>}
        {challenge.question && <p className="challenge-question">{challenge.question}</p>}
        {renderChallenge()}
      </div>
      </ScrollableContent>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        content={modalContent.content}
        buttons={modalContent.buttons}
      />
    </div>
  );
};