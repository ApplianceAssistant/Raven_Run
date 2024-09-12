import React, { useState, useEffect } from 'react';
import { saveGame, getGames, deleteGame, isValidGame } from '../services/gameCreatorService';
import ChallengeCreator from './ChallengeCreator';
import PathDisplay from './PathDisplay';
import { saveGameToLocalStorage, getGameFromLocalStorage, updateChallengeInLocalStorage } from '../utils/localStorageUtils';

const GameCreator = () => {
  const [game, setGame] = useState(getGameFromLocalStorage() || { id: 0, name: '', description: '', challenges: [] });
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (game.id !== 0) {
      saveGameToLocalStorage(game);
    }
  }, [game]);

  const handleCreateGame = () => {
    if (isValidGame(game)) {
      const newGame = { ...game, id: Date.now() };
      setGame(newGame);
      saveGameToLocalStorage(newGame);
    } else {
      alert('Please enter a game title');
    }
  };

  const handleDeleteGame = () => {
    if (game.id) {
      deleteGame(game.id);
      setGame({ id: 0, name: '', description: '', challenges: [] });
      setShowChallengeCreator(false);
      setCurrentChallenge(null);
      setIsEditing(false);
    }
  };

  const handleDeleteChallenge = () => {
    if (currentChallenge) {
      const updatedChallenges = game.challenges.filter(c => c.id !== currentChallenge.id);
      const updatedGame = { ...game, challenges: updatedChallenges };
      setGame(updatedGame);
      saveGameToLocalStorage(updatedGame);
      setCurrentChallenge(null);
      setShowChallengeCreator(false);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentChallenge) {
      let updatedChallenges;
      if (isEditing) {
        updatedChallenges = game.challenges.map(c => 
          c.id === currentChallenge.id ? currentChallenge : c
        );
      } else {
        updatedChallenges = [...game.challenges, currentChallenge];
      }
      const updatedGame = { ...game, challenges: updatedChallenges };
      setGame(updatedGame);
      saveGameToLocalStorage(updatedGame);
    }
    
    // Reset for a new challenge
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
    setAllRequiredFieldsFilled(false);
    setIsEditing(false);
  };

  const handleBack = () => {
    setShowChallengeCreator(false);
    setCurrentChallenge(null);
    setIsEditing(false);
  };

  const handleChallengeUpdate = (updatedChallenge) => {
    setCurrentChallenge(updatedChallenge);
    updateChallengeInLocalStorage(updatedChallenge);
  };

  const handleRequiredFieldsCheck = (allFilled) => {
    setAllRequiredFieldsFilled(allFilled);
  };

  const handleCreateNewChallenge = () => {
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
    setShowChallengeCreator(true);
    setIsEditing(false);
  };

  const handleEditChallenge = (challenge) => {
    setCurrentChallenge(challenge);
    setShowChallengeCreator(true);
    setIsEditing(true);
    setAllRequiredFieldsFilled(true); // Assume all fields are filled for an existing challenge
  };

  const renderButtons = () => {
    return (
      <div className="button-container-bottom">
        {showChallengeCreator && <button onClick={handleBack}>Back</button>}
        {currentChallenge && currentChallenge.type && <button onClick={handleDeleteChallenge}>Delete</button>}
        {allRequiredFieldsFilled && <button onClick={handleNext}>{isEditing ? 'Update' : 'Next'}</button>}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          {!showChallengeCreator ? (
            <PathDisplay 
              game={game}
              onCreateNewChallenge={handleCreateNewChallenge}
              onEditChallenge={handleEditChallenge}
            />
          ) : (
            <ChallengeCreator 
              challenge={currentChallenge}
              onUpdate={handleChallengeUpdate}
              onRequiredFieldsCheck={handleRequiredFieldsCheck}
            />
          )}
        </div>
      </div>
      {renderButtons()}
    </div>
  );
};

export default GameCreator;