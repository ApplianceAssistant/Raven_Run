import React, { useState, useEffect } from 'react';
import { checkLocationReached, getNextLocationHint, checkAnswer, getNextIncorrectFeedback, canDisplayHints, canDisplayDistance } from '../services/challengeService.ts';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';

export const Challenge = ({ challenge, onComplete, userLocation }) => {
  const [feedback, setFeedback] = useState('');
  const [isLocationReached, setIsLocationReached] = useState(false);
  const [hint, setHint] = useState('');
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    setTextVisible(false);
    setFeedback('');
    setIsCorrect(false);
    setAnswer('');
    setHint('');
    setIsLocationReached(false);

    // Trigger fade-in effect
    const textFadeTimer = setTimeout(() => setTextVisible(true), 300);

    if (canDisplayDistance(challenge)) {
      checkTravelChallenge();
    }

    return () => clearTimeout(textFadeTimer);
  }, [challenge, userLocation]);

  const checkTravelChallenge = () => {
    const intervalId = setInterval(() => {
      if (checkLocationReached(challenge, userLocation)) {
        setIsLocationReached(true);
        clearInterval(intervalId);
        if (challenge.completionFeedback) {
          setFeedback(challenge.completionFeedback);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  };

  const handleGetHint = () => {
    const newHint = getNextLocationHint(challenge);
    setHint(newHint);
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (challenge.type === 'trueFalse') {
      value = value === 'true';
    }
    setAnswer(value);
    setFeedback('');
    setIsCorrect(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const correct = checkAnswer(challenge, answer);
    setIsCorrect(correct);
    const feedbackText = correct ? challenge.feedbackTexts.correct : getNextIncorrectFeedback(challenge);
    setFeedback(feedbackText);

    if (correct || (!challenge.repeatable && challenge.type !== 'travel')) {
      setTimeout(() => {
        onComplete(correct);
      }, 2000);
    }
  };

  const handleContinue = () => {
    setTextVisible(false);
    setTimeout(() => {
      onComplete(true);
    }, 500);
  };

  const handleSkip = () => {
    setTextVisible(false);
    setTimeout(() => {
      onComplete(true);
    }, 500);
  };

  const renderSkipButton = () => (
    <button onClick={handleSkip} className="skip-button">Skip</button>
  );

  const renderChallenge = () => {
    switch (challenge.type) {
      case 'travel':
        return renderTravelChallenge();
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

  const renderTravelChallenge = () => (
    <>
      {isLocationReached && (
        <button onClick={handleContinue} className="continue-button">Continue</button>
      )}
    </>
  );

  const renderStoryChallenge = () => (
    <div className="story-challenge">
      <div className="story-text">{challenge.storyText}</div>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );

  const renderMultipleChoiceChallenge = () => (
    <form onSubmit={handleSubmit}>
      {challenge.options.map(option => (
        <label key={option}>
          <input
            type="radio"
            value={option}
            checked={answer === option}
            onChange={handleInputChange}
          />
          {option}
        </label>
      ))}
      {renderActionButton()}
    </form>
  );

  const renderTrueFalseChallenge = () => (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          type="radio"
          value="true"
          checked={answer === true}
          onChange={handleInputChange}
        />
        True
      </label>
      <label>
        <input
          type="radio"
          value="false"
          checked={answer === false}
          onChange={handleInputChange}
        />
        False
      </label>
      {renderActionButton()}
    </form>
  );

  const renderTextInputChallenge = () => (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={answer}
        onChange={handleInputChange}
      />
      {renderActionButton()}
    </form>
  );

  const renderAreaSearchChallenge = () => (
    <div>
      {challenge.clues.map((clue, index) => (
        <p key={index} className="clue">{clue}</p>
      ))}
      {renderActionButton()}
    </div>
  );    

  const renderActionButton = () => (
    <>
      {(isCorrect || !challenge.repeatable || (challenge.type === 'trueFalse' && feedback)) ? (
        <button onClick={handleContinue} className="continue-button">Continue</button>
      ) : (
        <button type="submit" className="submit-button">Submit</button>
      )}
    </>
  );

  return (
    <>
      <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
        <h2>{challenge.title}</h2>
        <ScrollableContent maxHeight="60vh">
          {challenge.description && <p className="challenge-description">{challenge.description}</p>}
          {challenge.question && <p className="challenge-question">{challenge.question}</p>}
          {renderChallenge()}
        </ScrollableContent>
        {hint && <p className="hint">{hint}</p>}
        <p className={`feedback ${feedback ? 'visible' : ''} ${isCorrect ? 'green' : ''}`}>{feedback}</p>
      </div>
      <div className="button-container-bottom">
      {challenge.type === 'story' && <TextToSpeech text={challenge.storyText} />}
      {challenge.type === 'travel' && <TextToSpeech text={challenge.description} />}
        {canDisplayHints(challenge) && (
          <button onClick={handleGetHint} className="hint-button">Hint</button>
        )}
        {renderSkipButton()}
      </div>
    </>
  );
};