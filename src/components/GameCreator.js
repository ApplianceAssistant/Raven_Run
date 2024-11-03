import React, { useState, useEffect } from 'react';
import { saveGame, getGames, deleteGame, isValidGame, generateUniquePathId } from '../services/gameCreatorService';
import { saveGameToLocalStorage, getGamesFromLocalStorage, updateChallengeInLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';
import ChallengeCreator from './ChallengeCreator';
import PathDisplay from './PathDisplay';
import Modal from './Modal';
import ToggleSwitch from './ToggleSwitch';
import '../css/GameCreator.scss';

const GameCreator = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showPathForm, setShowPathForm] = useState(false);
  const [newPathData, setNewPathData] = useState({ name: '', description: '', public: false, pathId: '' });
  const [isPublic, setIsPublic] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);
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
      setNewPathData({
        name: selectedGame.name,
        description: selectedGame.description,
        public: selectedGame.public ?? false,
        pathId: selectedGame.pathId || generateUniquePathId()
      });
      setIsPublic(selectedGame.public ?? false);
    }
  }, [selectedGame, isLoading]);

  useEffect(() => {
  }, [isPublic, newPathData.public]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "public") {
      setIsPublic(checked);
      setNewPathData(prev => ({ ...prev, public: checked }));
    } else {
      setNewPathData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreateNewPath = () => {
    //look here setNewPathData is causing an error
    setNewPathData(prev => ({ ...prev, pathId: generateUniquePathId() }));
    setShowPathForm(true);
  };

  const handlePathFormSubmit = () => {
    if (isValidGame(newPathData)) {
      const newGame = {
        ...newPathData,
        id: Date.now(),
        challenges: [],
        public: newPathData.public,
        pathId: newPathData.pathId
      };
      setGames(prevGames => [...prevGames, newGame]);
      setSelectedGame(newGame);
      saveGame(newGame);
      setShowPathForm(false);
      setNewPathData({ name: '', description: '', public: false, pathId: '' });
    } else {
      alert('Please enter a path title');
    }
  };

  const handleSelectPath = (game) => {
    setIsPublic(game.public);
    setSelectedGame(game);
    setNewPathData(prevData => ({
      ...prevData,
      name: game.name,
      description: game.description,
      public: game.public,
      pathId: game.pathId
    }));
    setIsEditingPath(true);
  };

  const handlePathUpdate = () => {
    if (isValidGame(newPathData)) {
      const updatedGame = { ...selectedGame, ...newPathData };
      setSelectedGame(updatedGame);
      setGames(prevGames => prevGames.map(g => g.id === updatedGame.id ? updatedGame : g));
      saveGame(updatedGame);
      setIsEditingPath(false);
    } else {
      alert('Please enter a path title');
    }
  };

  const handleDeleteConfirmation = (game) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmedDelete = () => {
    if (gameToDelete) {
      handleDeletePath(gameToDelete.id);
      setIsDeleteModalOpen(false);
      setGameToDelete(null);
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
      <h2 className="contentHeader">{games.length > 0 ? "Saved Paths" : "Create Your First Path"}</h2>
      {games.length > 0 ? (
        games.map(game => (
          <div key={game.id} className="game-item">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <p>Challenges: {game.challenges.length}</p>
            <p>Created: {new Date(game.id).toLocaleDateString()}</p>
            <button onClick={() => handleSelectPath(game)}>Select</button>
            <button onClick={() => handleDeleteConfirmation(game)}>Delete</button>
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
      <div className="field-container">
        <div className="path-id-display">ID: {newPathData.pathId}</div>
      </div>
      <form className="content flex-top">
        <div className="field-container">
          <label htmlFor="pathName">Path Name:</label>
          <input
            type="text"
            id="pathName"
            name="name"
            placeholder="Enter path name"
            value={newPathData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="field-container">
          <label htmlFor="pathDescription">Path Description:</label>
          <textarea
            id="pathDescription"
            name="description"
            placeholder="Enter path description"
            value={newPathData.description}
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
            id="pathPublic"
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
    console.log('Button container visible:', buttonContainerVisible);
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
      <div className="content center">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="content game-creator">
            {renderContent()}
          </div>
          {renderButtons()}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete"
            content={`Are you sure you want to delete this path and all of its challenges?`}
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
        </>
      )}
      </div>
    </div>
  );
};

export default GameCreator;