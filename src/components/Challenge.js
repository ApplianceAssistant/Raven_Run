import React, { useState } from 'react';
import { checkAnswer, getRandomIncorrectFeedback } from '../services/challengeService.ts';

export const Challenge = ({ challenge, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const correct = checkAnswer(challenge, answer);
    setFeedback(correct ? challenge.feedbackTexts.correct : getRandomIncorrectFeedback(challenge));
    onComplete(correct);
  };

  return (
    <div>
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
      {feedback && <p>{feedback}</p>}
    </div>
  );
};