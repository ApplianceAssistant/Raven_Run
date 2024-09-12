import React, { useState, useEffect } from 'react';
import { saveGame, getGames, deleteGame, getCharacterCount, isValidGame, GameTypes } from '../services/gameCreatorService';
import ChallengeCreator from './ChallengeCreator';
import PathStructure from './PathStructure';

const GameCreator = () => {
  const [game, setGame] = useState({ id: 0, name: '', description: '', challenges: [] });
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [showPathStructure, setShowPathStructure] = useState(false);
  const [descriptionCharCount, setDescriptionCharCount] = useState(500);
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);

  const MAX_DESCRIPTION_LENGTH = 500;

  useEffect(() => {
    setDescriptionCharCount(getCharacterCount(game.description, MAX_DESCRIPTION_LENGTH));
  }, [game.description]);

  useEffect(() => {
    setButtonContainerVisible(game.name.trim() !== '' || showChallengeCreator || showPathStructure);
  }, [game.name, showChallengeCreator, showPathStructure]);

  const handleCreateGame = () => {
    if (isValidGame(game)) {
      const newGame = { ...game, id: Date.now() };
      saveGame(newGame);
      setGame(newGame);
    } else {
      alert('Please enter a game title');
    }
  };

  const handleDeleteGame = () => {
    if (game.id) {
      deleteGame(game.id);
      setGame({ id: 0, name: '', description: '', challenges: [] });
      setShowChallengeCreator(false);
      setShowPathStructure(false);
    }
  };

  const handleNext = () => {
    if (!showChallengeCreator) {
      setShowChallengeCreator(true);
    }
  };

  const handleNextChallenge = (updatedGame) => {
    setGame(updatedGame);
    // You can add any additional logic here if needed
  };

  const handleBack = () => {
    if (showPathStructure) {
      setShowPathStructure(false);
      setShowChallengeCreator(true);
    } else if (showChallengeCreator) {
      setShowChallengeCreator(false);
    }
  };

  const handleFinish = () => {
    saveGame(game);
    setShowPathStructure(true);
    setShowChallengeCreator(false);
  };

  const handleChallengeClick = (challengeId) => {
    setShowPathStructure(false);
    setShowChallengeCreator(true);
    // Find the challenge and set it as the current challenge in ChallengeCreator
    // You'll need to modify ChallengeCreator to accept an initial challenge state
  };

  const renderButtons = () => {
    return (
      <div className={`button-container-bottom ${buttonContainerVisible ? 'visible' : ''}`}>
        {(showChallengeCreator || showPathStructure) && <button onClick={handleBack}>Back</button>}
        {!showChallengeCreator && !showPathStructure && game.name.trim() !== '' && <button onClick={handleNext}>Next</button>}
        {game.id !== 0 && <button onClick={handleDeleteGame}>Delete</button>}
        {showChallengeCreator && <button onClick={handleFinish}>Finish</button>}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          {!showChallengeCreator && !showPathStructure ? (
            <>
              <h1 className="contentHeader">Create Your Own Path</h1>
              <div className="bodyContent center">
                <form onSubmit={(e) => { e.preventDefault(); handleCreateGame(); }}>
                  <div className="account-field">
                    <label htmlFor="gameName">Path Title:</label>
                    <input
                      type="text"
                      id="gameName"
                      value={game.name}
                      onChange={(e) => setGame({ ...game, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="account-field">
                    <label htmlFor="gameDescription">Path Description:</label>
                    <textarea
                      id="gameDescription"
                      value={game.description}
                      onChange={(e) => setGame({ ...game, description: e.target.value })}
                    />
                    <div className="char-count">
                      {descriptionCharCount} characters remaining
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : showChallengeCreator ? (
            <ChallengeCreator 
              game={game}
              setGame={setGame}
              onNext={handleNextChallenge}
            />
          ) : (
            <PathStructure 
              game={game}
              onChallengeClick={handleChallengeClick}
            />
          )}
        </div>
      </div>
      {renderButtons()}
    </div>
  );
};

export default GameCreator;