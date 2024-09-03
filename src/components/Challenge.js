import React, { useState, useEffect } from 'react';
import { checkLocationReached, getNextLocationHint, checkAnswer, getNextIncorrectFeedback } from '../services/challengeService.ts';
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

    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);

    if (challenge.type === 'travel') {
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

  const handleTravelComplete = () => {
    if (challenge.completionFeedback) {
      setFeedback(challenge.completionFeedback);
      setIsCorrect(true);
    } else {
      handleContinue();
    }
  };

  const handleGetHint = () => {
    const newHint = getNextLocationHint(challenge);
    setHint(newHint);
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    // Convert "true" and "false" strings to booleans for trueFalse challenges
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
    setFeedback(correct ? challenge.feedbackTexts.correct : getNextIncorrectFeedback(challenge));
    setIsCorrect(correct);
  };

  const handleContinue = () => {
    setTextVisible(false);
    setTimeout(() => {
      onComplete(true);
    }, 500);
  };

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
      default:
        return <p>Unsupported challenge type</p>;
    }
  };

  const renderTravelChallenge = () => (
    <div>
      {!isLocationReached && (
        <div className="button-container">
          <button onClick={handleGetHint} className="hint-button">Get Hint</button>
        </div>
      )}
      {hint && <p className="hint">{hint}</p>}
      {isLocationReached && (
        <div className="button-container">
          <button onClick={handleContinue} className="continue-button">Continue</button>
        </div>
      )}
    </div>
  );

  const renderStoryChallenge = () => (
    <div className="story-challenge">
      <ScrollableContent maxHeight="400px">
        <div className="story-text">{challenge.storyText}</div>
      </ScrollableContent>
      <div className="button-container">
        <button onClick={handleContinue}>Continue</button>
      </div>
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

  const renderActionButton = () => (
    <div className="button-container">
      {isCorrect ? (
        <button onClick={handleContinue} className="continue-button">Continue</button>
      ) : (
        <button type="submit" className="submit-button">Submit</button>
      )}
    </div>
  );

  return (
    <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
      <h2>{challenge.title}</h2>
      {challenge.type === 'story' && <TextToSpeech text={challenge.storyText} />}
      {challenge.description && <p className="challenge-description">{challenge.description}</p>}
      {challenge.question && <p className="challenge-question">{challenge.question}</p>}
      {renderChallenge()}
      <p className={`feedback ${feedback ? 'visible' : ''} ${isCorrect ? 'green' : ''}`}>{feedback}</p>
    </div>
  );
};