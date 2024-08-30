import React, { useState, useEffect } from 'react';
import { checkAnswer, getRandomIncorrectFeedback } from '../services/challengeService.ts';

export const Challenge = ({ challenge, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const textFadeTimer = setTimeout(() => setTextVisible(true), 700);
    return () => clearTimeout(textFadeTimer);
  }, []);

  useEffect(() => {
    let fadeOutTimer;
    if (feedback) {
      setIsFeedbackVisible(true);
      const feedbackLength = feedback.length;
      const fadeOutDelay = Math.min(Math.max(feedbackLength * 100, 5000), 7000); // 5-7 seconds based on length
      fadeOutTimer = setTimeout(() => setIsFeedbackVisible(false), fadeOutDelay);
    }
    return () => clearTimeout(fadeOutTimer);
  }, [feedback]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correct = checkAnswer(challenge, answer);
    setFeedback(correct ? challenge.feedbackTexts.correct : getRandomIncorrectFeedback(challenge));
    
    // Delay onComplete for correct answers
    if (correct) {
      setTimeout(() => onComplete(correct), 2000);  // 2-second delay
    } else {
      onComplete(correct);
    }
  };

  const handleInputChange = (e) => {
    setAnswer(e.target.value);
    setIsFeedbackVisible(false);
  };

  return (
    <div className={`challengeBody ${textVisible ? 'visible' : ''}`}>
      <h2>{challenge.title}</h2>
      <p>{challenge.description}</p>
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
        {challenge.type === 'latLong' && (
          <>
            <input
              type="number"
              placeholder="Latitude"
              onChange={(e) => setAnswer([parseFloat(e.target.value), answer[1] || 0])}
            />
            <input
              type="number"
              placeholder="Longitude"
              onChange={(e) => setAnswer([answer[0] || 0, parseFloat(e.target.value)])}
            />
          </>
        )}
        {challenge.type === 'text' && (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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