import React, { useState, useEffect } from 'react';
import { saveGame, getGames, deleteGame, isValidGame, generateUniqueGameId } from '../services/gameCreatorService';
import { saveGameToLocalStorage, getGamesFromLocalStorage, updateChallengeInLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';
import ChallengeCreator from './ChallengeCreator';
import GameDisplay from './GameDisplay';
import Modal from './Modal';
import ToggleSwitch from './ToggleSwitch';
import '../css/GameCreator.scss';

const GameCreator = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGameData, setNewGameData] = useState({ name: '', description: '', public: false, gameId: '' });
  const [isPublic, setIsPublic] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [buttonContainerVisible, setButtonContainerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      const savedGames = await getGames();
      setGames(savedGames);
      setIsLoading(false);
    };
    loadGames();
  }, []);

  useEffect(() => {
    if (selectedGame && !isLoading) {
      setNewGameData({
        name: selectedGame.name,
        description: selectedGame.description,
        public: selectedGame.public ?? false,
        gameId: selectedGame.gameId || generateUniqueGameId()
      });
      setIsPublic(selectedGame.public ?? false);
    }
  }, [selectedGame, isLoading]);

  useEffect(() => {
  }, [isPublic, newGameData.public]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "public") {
      setIsPublic(checked);
      setNewGameData(prev => ({ ...prev, public: checked }));
    } else {
      setNewGameData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreateNewGame = async () => {
    const gameId = await generateUniqueGameId();
    setNewGameData(prev => ({ ...prev, gameId }));
    setShowGameForm(true);
  };

  const handleGameFormSubmit = () => {
    if (isValidGame(newGameData)) {
      const newGame = {
        ...newGameData,
        id: Date.now(),
        challenges: [],
        public: newGameData.public,
        gameId: newGameData.gameId
      };
      setGames(prevGames => [...prevGames, newGame]);
      setSelectedGame(newGame);
      saveGame(newGame);
      setShowGameForm(false);
      setNewGameData({ name: '', description: '', public: false, gameId: '' });
    } else {
      alert('Please enter a game title');
    }
  };

  const handleSelectGame = (game) => {
    setIsPublic(game.public);
    setSelectedGame(game);
    setNewGameData(prevData => ({
      ...prevData,
      name: game.name,
      description: game.description,
      public: game.public,
      gameId: game.gameId
    }));
    setIsEditingGame(true);
  };

  const handleGameUpdate = () => {
    if (isValidGame(newGameData)) {
      const updatedGame = { ...selectedGame, ...newGameData };
      setSelectedGame(updatedGame);
      setGames(prevGames => prevGames.map(g => g.id === updatedGame.id ? updatedGame : g));
      saveGame(updatedGame);
      setIsEditingGame(false);
    } else {
      alert('Please enter a game title');
    }
  };

  const handleDeleteConfirmation = (game) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmedDelete = () => {
    if (gameToDelete) {
      handleDeleteGame(gameToDelete.id);
      setIsDeleteModalOpen(false);
      setGameToDelete(null);
    }
  };

  const handleDeleteGame = (gameId) => {
    const updatedGames = games.filter(game => game.id !== gameId);
    setGames(updatedGames);
    deleteGame(gameId);
    if (selectedGame && selectedGame.id === gameId) {
      setSelectedGame(null);
    }
  };

  const handleDeleteChallenge = () => {
    console.log('Deleting challenge called');
    if (currentChallenge && selectedGame) {
      console.warn('Deleting challenge:', currentChallenge);
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
    } else {
      alert('Error deleting challenge. Please try again.');
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
    console.log('Next called');
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
      <h2 className="contentHeader">{games.length > 0 ? "Saved Games" : "Create Your First Game"}</h2>
      {games.length > 0 ? (
        games.map(game => (
          <div key={game.id} className="game-item">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <p>Challenges: {game.challenges.length}</p>
            <p>Created: {new Date(game.id).toLocaleDateString()}</p>
            <button onClick={() => handleSelectGame(game)}>Select</button>
            <button onClick={() => handleDeleteConfirmation(game)}>Delete</button>
          </div>
        ))
      ) : (
        <p>You haven't created any games yet.<br></br>Click the button below to get started!</p>
      )}
      <button onClick={handleCreateNewGame}>Create New Game</button>
    </div>
  );

  const renderGameForm = () => (
    <div className="game-form">
      <h2 className="contentHeader">{isEditingGame ? "Edit Game" : "Create New Game"}</h2>
      <div className="field-container">
        <div className="game-id-display">ID: {newGameData.gameId}</div>
      </div>
      <form className="content flex-top">
        <div className="field-container">
          <label htmlFor="gameName">Game Name:</label>
          <input
            type="text"
            id="gameName"
            name="name"
            placeholder="Enter game name"
            value={newGameData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="field-container">
          <label htmlFor="gameDescription">Game Description:</label>
          <textarea
            id="gameDescription"
            name="description"
            placeholder="Enter game description"
            value={newGameData.description}
            onChange={handleInputChange}
            rows="4"
          />
        </div>
        <div className="field-container">
          <ToggleSwitch
            checked={isPublic}
            onToggle={(e) => {
              setIsPublic(e.target.checked);
              handleInputChange(e);
            }}
            label={isPublic ? 'Public' : 'Private'}
            name="public"
            id="gamePublic"
          />
        </div>
        <div className="button-container">
          <button type="button" onClick={() => {
            setIsEditingGame(false);
            setShowGameForm(false);
            setSelectedGame(null);
          }}>Cancel</button>
          <button type="button" onClick={isEditingGame ? handleGameUpdate : handleGameFormSubmit} className="submit-button">
            {isEditingGame ? "Update Game" : "Create Game"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    if (isEditingGame || showGameForm) {
      return renderGameForm();
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
      <GameDisplay
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
          <button onClick={() => setSelectedGame(null)}>Back to Game List</button>
        )}
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="content center">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        < >
          <div className="content game-creator">
            {renderContent()}
          </div>
          {renderButtons()}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete"
            content={`Are you sure you want to delete this game and all of its challenges?`}
            buttons={[
              {
                label: 'Cancel',
                onClick: () => setIsDeleteModalOpen(false),
                className: 'secondary'
              },
              {
                label: 'Delete',
                onClick: handleConfirmedDelete,
                className: 'danger'
              }
            ]}
          />
        </ >
      )}
      </div>
    </div>
  );
};

export default GameCreator;