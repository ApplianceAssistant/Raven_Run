import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import ScrollableContent from './ScrollableContent';

export const Challenge = ({ challenge, userLocation, challengeState, onStateChange, onContinue }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [] });
  
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

  const renderStoryChallenge = () => (
    <div className="story-challenge">
      <div className="story-text">{challenge.storyText}</div>
      {challengeState.textVisible && (
        <div className="continue-button-container">
          <button onClick={onContinue} className="continue-button">Continue</button>
        </div>
      )}
    </div>
  );

  const renderMultipleChoiceChallenge = () => {
    if (!challenge.options || !Array.isArray(challenge.options)) {
      return <p>No options available for this challenge.</p>;
    }
    return (
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
              {challenge.description.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < challenge.description.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
          {challenge.question && (
            <p className="challenge-question">
              {challenge.question.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < challenge.question.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
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