import React, { useState } from 'react';
import ScrollableContent from './ScrollableContent';
import { cleanText } from '../utils/utils';

export const Challenge = ({ challenge, challengeState, onStateChange, onContinue }) => {

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
      case 'travel':
        return '';
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

  const renderStoryChallenge = () => {
    return;
    /*return (
      <div className="story-challenge">
        {cleanText(challenge.description, { asJsx: true })}
      </div>
    );*/
  };

  const renderMultipleChoiceChallenge = () => {
    if (!challenge.options || !Array.isArray(challenge.options)) {
      return <p>No options available for this challenge.</p>;
    }
    return (
      <div className="multiple-choice-challenge">
        {cleanText(challenge.description, { asJsx: true })}
        <div className="options">
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
        </div>
      </div>
    );
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

  return (
    <div className={`challengeBody ${challengeState.textVisible ? 'visible' : ''}`}>
      <ScrollableContent maxHeight="60vh">
        <h2>{challenge.title}</h2>
        <div className="challenge-content">
          {challenge.description && (
            <p className="challenge-description">
              {cleanText(challenge.description, { asJsx: true })}
            </p>
          )}
          {challenge.question && (
            <p className="challenge-question">
              {cleanText(challenge.question, { asJsx: true })}
            </p>
          )}
          {renderChallenge()}
        </div>
      </ScrollableContent>
    </div>
  );
};