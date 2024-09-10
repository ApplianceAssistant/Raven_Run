import React, { useEffect } from 'react';
import { checkLocationReached, canDisplayDistance } from '../services/challengeService.ts';
import ScrollableContent from './ScrollableContent';

export const Challenge = ({ challenge, userLocation, challengeState, onStateChange }) => {
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
        return <p>Unsupported challenge type</p>;
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

  const renderMultipleChoiceChallenge = () => (
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
  );

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

  const renderAreaSearchChallenge = () => (
    <div>
      {challenge.clues.map((clue, index) => (
        <p key={index} className="clue">{clue}</p>
      ))}
    </div>
  );

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
      <div className="feedback-hint-area">
        {challengeState.hint && <p className="hint">{challengeState.hint}</p>}
        <p className={`feedback ${challengeState.feedback ? 'visible' : ''} ${challengeState.isCorrect ? 'green' : ''}`}>{challengeState.feedback}</p>
      </div>
    </div>
  );
};