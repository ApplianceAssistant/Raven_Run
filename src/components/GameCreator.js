import React, { useState, useEffect } from 'react';
import { saveGame, getGames, deleteGame, isValidGame } from '../services/gameCreatorService';
import { saveGameToLocalStorage, getGamesFromLocalStorage, updateChallengeInLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';
import ChallengeCreator from './ChallengeCreator';
import PathDisplay from './PathDisplay';
import TextToSpeech from './TextToSpeech';
import '../css/GameCreator.scss';

const GameCreator = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showPathForm, setShowPathForm] = useState(false);
  const [newPathData, setNewPathData] = useState({ name: '', description: '' });
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);

  useEffect(() => {
    const savedGames = getGames();
    setGames(savedGames);
  }, []);

  useEffect(() => {
    if (selectedGame) {
      saveGameToLocalStorage(selectedGame);
    }
  }, [selectedGame]);

  const handleCreateNewPath = () => {
    setShowPathForm(true);
  };

  const handlePathFormSubmit = () => {
    if (isValidGame(newPathData)) {
      const newGame = { ...newPathData, id: Date.now(), challenges: [] };
      setGames([...games, newGame]);
      setSelectedGame(newGame);
      saveGame(newGame);
      setShowPathForm(false);
      setNewPathData({ name: '', description: '' });
    } else {
      alert('Please enter a path title');
    }
  };

  const handleSelectPath = (game) => {
    setSelectedGame(game);
    setNewPathData({ name: game.name, description: game.description });
    setIsEditingPath(true);
  };

  const handlePathUpdate = () => {
    if (isValidGame(newPathData)) {
      const updatedGame = { ...selectedGame, ...newPathData };
      setSelectedGame(updatedGame);
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
      saveGame(updatedGame);
      setIsEditingPath(false);
    } else {
      alert('Please enter a path title');
    }
  };

  const handleDeletePath = (gameId) => {
    const updatedGames = games.filter(game => game.id !== gameId);
    setGames(updatedGames);
    deleteGame(gameId);
    if (selectedGame && selectedGame.id === gameId) {
      setSelectedGame(null);
    }
  };

  const handleDeleteChallenge = () => {
    if (currentChallenge && selectedGame) {
      const updatedChallenges = selectedGame.challenges.filter(
        challenge => challenge.id !== currentChallenge.id
      );
      const updatedGame = { ...selectedGame, challenges: updatedChallenges };
      
      setSelectedGame(updatedGame);
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
      saveGame(updatedGame);
      
      setCurrentChallenge(null);
      setShowChallengeCreator(false);
      setAllRequiredFieldsFilled(false);
      setIsEditing(false);
    }
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
    });
    setShowChallengeCreator(true);
    setIsEditing(false);
  };

  const handleEditChallenge = (challenge) => {
    setCurrentChallenge(challenge);
    setShowChallengeCreator(true);
    setIsEditing(true);
    setAllRequiredFieldsFilled(true);
  };

  const handleChallengeUpdate = (updatedChallenge) => {
    setCurrentChallenge(updatedChallenge);
    updateChallengeInLocalStorage(selectedGame.id, updatedChallenge);
  };

  const handleRequiredFieldsCheck = (allFilled) => {
    setAllRequiredFieldsFilled(allFilled);
  };

  const handleNext = () => {
    if (currentChallenge) {
      let updatedChallenges;
      if (isEditing) {
        updatedChallenges = selectedGame.challenges.map(c =>
          c.id === currentChallenge.id ? currentChallenge : c
        );
      } else {
        updatedChallenges = [...selectedGame.challenges, currentChallenge];
      }
      const updatedGame = { ...selectedGame, challenges: updatedChallenges };
      setSelectedGame(updatedGame);
      setGames(games.map(g => g.id === updatedGame.id ? updatedGame : g));
      saveGame(updatedGame);
    }

    setCurrentChallenge(null);
    setShowChallengeCreator(false);
    setAllRequiredFieldsFilled(false);
    setIsEditing(false);
  };

  const handleBack = () => {
    setShowChallengeCreator(false);
    setCurrentChallenge(null);
    setIsEditing(false);
  };

  const renderGameList = () => (
    <div className="game-list">
      <h2 className="contentHeader">{games.length > 0 ? "Saved Paths" : "Create Your First Path"}</h2>
      {games.length > 0 ? (
        games.map(game => (
          <div key={game.id} className="game-item">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <p>Challenges: {game.challenges.length}</p>
            <p>Created: {new Date(game.id).toLocaleDateString()}</p>
            <button onClick={() => handleSelectPath(game)}>Select</button>
            <button onClick={() => handleDeletePath(game.id)}>Delete</button>
          </div>
        ))
      ) : (
        <p>You haven't created any paths yet.<br></br>Click the button below to get started!</p>
      )}
      <button onClick={handleCreateNewPath}>Create New Path</button>
    </div>
  );

  const renderPathForm = () => (
    <div className="path-form">
      <h2 className="contentHeader">{isEditingPath ? "Edit Path" : "Create New Path"}</h2>
      <form className="content">
        <div className="field-container">
          <label htmlFor="pathName">Path Name:</label>
          <input
            type="text"
            id="pathName"
            placeholder="Enter path name"
            value={newPathData.name}
            onChange={(e) => setNewPathData({ ...newPathData, name: e.target.value })}
            required
          />
        </div>
        <div className="field-container">
          <label htmlFor="pathDescription">Path Description:</label>
          <textarea
            id="pathDescription"
            placeholder="Enter path description"
            value={newPathData.description}
            onChange={(e) => setNewPathData({ ...newPathData, description: e.target.value })}
            rows="4"
          />
        </div>
        <div className="button-container">
        <button type="button" onClick={() => {
            setIsEditingPath(false);
            setShowPathForm(false);
            setSelectedGame(null);
          }}>Cancel</button>
          <button type="button" onClick={isEditingPath ? handlePathUpdate : handlePathFormSubmit} className="submit-button">
            {isEditingPath ? "Update Path" : "Create Path"}
          </button>
          
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    if (isEditingPath || showPathForm) {
      return renderPathForm();
    }
  
    if (!selectedGame) {
      return renderGameList();
    }
  
    if (showChallengeCreator) {
      return (
        <ChallengeCreator
          challenge={currentChallenge}
          onUpdate={handleChallengeUpdate}
          onRequiredFieldsCheck={handleRequiredFieldsCheck}
        />
      );
    }
  
    return (
      <PathDisplay
        game={selectedGame}
        onCreateNewChallenge={handleCreateNewChallenge}
        onEditChallenge={handleEditChallenge}
      />
    );
  };

  const renderButtons = () => {
    if (!currentChallenge) return null;
    return (
      <div className={`button-container-bottom visible`}>
        {showChallengeCreator && <button onClick={handleBack}>Back</button>}
        {currentChallenge && currentChallenge.type && (
          <button onClick={handleDeleteChallenge}>Delete Challenge</button>
        )}
        {showChallengeCreator && allRequiredFieldsFilled && (
          <button onClick={handleNext}>{isEditing ? 'Update' : 'Next'}</button>
        )}
        {!showChallengeCreator && (
          <button onClick={() => setSelectedGame(null)}>Back to Path List</button>
        )}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content game-creator">
          {renderContent()}
        </div>
      </div>
      {renderButtons()}
    </div>
  );
};

export default GameCreator;