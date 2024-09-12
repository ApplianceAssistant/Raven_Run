import React, { useState, useEffect } from 'react';
import { GameTypes } from '../services/gameCreatorService';

const ChallengeCreator = ({ game, setGame, onNext }) => {
  const [currentChallenge, setCurrentChallenge] = useState({
    id: Date.now().toString(),
    type: '',
    title: '',
    description: '',
    question: '',
    hints: [''],
    feedbackTexts: { correct: '', incorrect: [''] },
    options: [''],
    correctAnswer: '',
    repeatable: false,
    targetLocation: { latitude: 0, longitude: 0 },
    radius: 0,
    completionFeedback: '',
    clues: [''],
  });

  const challengeTypes = [
    'story',
    'multipleChoice',
    'trueFalse',
    'textInput',
    'travel',
    'areaSearch'
  ];

  useEffect(() => {
    updateGameChallenges();
  }, [currentChallenge]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentChallenge(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    setCurrentChallenge(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setCurrentChallenge(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    setCurrentChallenge(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateGameChallenges = () => {
    setGame(prevGame => ({
      ...prevGame,
      challenges: prevGame.challenges.map(challenge => 
        challenge.id === currentChallenge.id ? currentChallenge : challenge
      )
    }));
  };

  const handleNext = () => {
    const updatedGame = {
      ...game,
      challenges: [...game.challenges, currentChallenge]
    };
    setGame(updatedGame);
    onNext(updatedGame);
    // Reset the current challenge
    setCurrentChallenge({
      id: Date.now().toString(),
      type: '',
      title: '',
      description: '',
      question: '',
      hints: [''],
      feedbackTexts: { correct: '', incorrect: [''] },
      options: [''],
      correctAnswer: '',
      repeatable: false,
      targetLocation: { latitude: 0, longitude: 0 },
      radius: 0,
      completionFeedback: '',
      clues: [''],
    });
  };

  const renderFields = () => {
    switch (currentChallenge.type) {
      case 'story':
        return (
          <>
            <textarea
              name="description"
              value={currentChallenge.description}
              onChange={handleInputChange}
              placeholder="Story Text"
            />
          </>
        );
      case 'multipleChoice':
        return (
          <>
            <input
              type="text"
              name="question"
              value={currentChallenge.question}
              onChange={handleInputChange}
              placeholder="Question"
            />
            {currentChallenge.options.map((option, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleArrayChange(e, index, 'options')}
                  placeholder={`Option ${index + 1}`}
                />
                <button type="button" onClick={() => removeArrayItem(index, 'options')}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('options')}>Add Option</button>
            <input
              type="text"
              name="correctAnswer"
              value={currentChallenge.correctAnswer}
              onChange={handleInputChange}
              placeholder="Correct Answer"
            />
          </>
        );
      // Add cases for other challenge types...
      default:
        return null;
    }
  };

  return (
    <div className="challenge-creator">
      <h1 className="contentHeader">{game.name}</h1>
      <h2>Create a Challenge</h2>
      <form>
        <div className="account-field">
          <label htmlFor="challengeTitle">Challenge Title:</label>
          <input
            type="text"
            id="challengeTitle"
            name="title"
            value={currentChallenge.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="account-field">
          <label htmlFor="challengeType">Challenge Type:</label>
          <select
            id="challengeType"
            name="type"
            value={currentChallenge.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a challenge type</option>
            {challengeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {renderFields()}
      </form>
      <div className="button-container-bottom">
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );


};

export default ChallengeCreator;