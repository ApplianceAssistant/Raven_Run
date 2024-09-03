import React, { useState, useEffect } from 'react';
import { checkAnswer, getNextIncorrectFeedback, checkLocationReached, getNextLocationHint } from '../services/challengeService.ts';

export const Challenge = ({ challenge, onComplete, userLocation }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [storyRead, setStoryRead] = useState(false);

  useEffect(() => {
    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);
    return () => clearTimeout(textFadeTimer);
  }, []);

  useEffect(() => {
    let fadeOutTimer;
    if (feedback) {
      setIsFeedbackVisible(true);
      const feedbackLength = feedback.length;
      const fadeOutDelay = Math.min(Math.max(feedbackLength * 100, 5000), 7000);
      fadeOutTimer = setTimeout(() => setIsFeedbackVisible(false), fadeOutDelay);
    }
    return () => clearTimeout(fadeOutTimer);
  }, [feedback]);
  useEffect(() => {
    if (challenge.type === 'travel') {
      const intervalId = setInterval(() => {
        if (checkLocationReached(challenge, userLocation)) {
          setFeedback(challenge.completionFeedback);
          setIsFeedbackVisible(true);
          clearInterval(intervalId);
          onComplete(true);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [challenge, userLocation]);

  const handleGetHint = () => {
    const hint = getNextLocationHint(challenge);
    setFeedback(hint);
    setIsFeedbackVisible(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (challenge.type === 'story') {
      setStoryRead(true);
      onComplete(true);
    } else {
      const correct = checkAnswer(challenge, answer);
      setFeedback(correct ? challenge.feedbackTexts.correct : getNextIncorrectFeedback(challenge));
      if (correct) {
        setTimeout(() => onComplete(correct), 2000);
      } else {
        onComplete(correct);
      }
    }
  };

  const handleInputChange = (e) => {
    setAnswer(e.target.value);
    setIsFeedbackVisible(false);
  };

  if (challenge.type === 'story') {
    if (!challenge.repeatable && storyRead) {
      return null; // Don't render anything if the story is not repeatable and has been read
    }
    return (
      <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
        <h2>{challenge.title}</h2>
        <p className="challenge-description">{challenge.description}</p>
        <p className="challenge-question">{challenge.question}</p>
        <div className="story-text">{challenge.storyText}</div>
        <button onClick={handleSubmit}>Continue</button>
      </div>
    );
  }

  if (challenge.type === 'travel') {
    return (
      <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
        <div className="challenge travel-challenge">
          <h2>{challenge.title}</h2>
          <p>{challenge.description}</p>
          <p>{challenge.question}</p>
          <button onClick={handleGetHint}>Get Hint</button>
          {feedback && (
            <p className={`challengeFeedback ${isFeedbackVisible ? 'visible' : ''}`}>
              {feedback}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
      <h2>{challenge.title}</h2>
      <p className="challenge-description">{challenge.description}</p>
      <p className="challenge-question">{challenge.question}</p>
      <form onSubmit={handleSubmit}>
        {challenge.type === 'multipleChoice' && challenge.options && (
          challenge.options.map(option => (
            <label key={option}>
              <input
                type="radio"
                value={option}
                checked={answer === option}
                onChange={(e) => setAnswer(e.target.value)}
              />
              {option}
            </label>
          ))
        )}
        {challenge.type === 'trueFalse' && (
          <>
            <label>
              <input
                type="radio"
                value="true"
                checked={answer === "true"}
                onChange={(e) => setAnswer(e.target.value)}
              />
              True
            </label>
            <label>
              <input
                type="radio"
                value="false"
                checked={answer === "false"}
                onChange={(e) => setAnswer(e.target.value)}
              />
              False
            </label>
          </>
        )}
        {challenge.type === 'textInput' && (
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
          />
        )}
        <button type="submit">Submit</button>
      </form>
      {feedback && (
        <p className={`challengeFeedback ${isFeedbackVisible ? 'visible' : ''}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};