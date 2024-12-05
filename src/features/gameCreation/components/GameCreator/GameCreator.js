import React, { useState, useEffect } from 'react';
import { useGameCreation } from '../../context/GameCreationContext';
import GameList from '../GameList/GameList';
import GameForm from '../GameForm/GameForm';
import ChallengeCreator from '../../../../components/ChallengeCreator';
import GameDisplay from '../../../../components/GameDisplay';
import Modal from '../../../../components/Modal';
import { generateUniqueGameId, saveGame, deleteGame, getGames } from '../../services/gameCreatorService';
import '../../../../css/GameCreator.scss';

const GameCreator = () => {
  const { state, dispatch } = useGameCreation();
  const { games = [], selectedGame = null, isLoading = false, error = null } = state || {};
  
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGameData, setNewGameData] = useState({ 
    name: '', 
    description: '', 
    public: false, 
    gameId: '' 
  });
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedGames = await getGames();
        dispatch({ type: 'SET_GAMES', payload: savedGames });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };
    loadGames();
  }, [dispatch]);

  const handleGameSelect = (game) => {
    dispatch({ type: 'SELECT_GAME', payload: game });
    setNewGameData({
      name: game.name,
      description: game.description,
      public: game.public ?? false,
      gameId: game.gameId
    });
  };

  const handleCreateNewGame = async () => {
    const gameId = await generateUniqueGameId();
    setNewGameData({ 
      name: '', 
      description: '', 
      public: false, 
      gameId 
    });
    setShowGameForm(true);
    setIsEditing(false);
  };

  const handleSaveGame = async (gameData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const savedGame = await saveGame(gameData);
      
      const updatedGames = games.map(g => 
        g.gameId === savedGame.gameId ? savedGame : g
      );
      
      if (!games.find(g => g.gameId === savedGame.gameId)) {
        updatedGames.push(savedGame);
      }
      
      dispatch({ type: 'SET_GAMES', payload: updatedGames });
      setShowGameForm(false);
      handleGameSelect(savedGame);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleDeleteGame = (game) => {
    setGameToDelete(game);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteGame = async () => {
    try {
      await deleteGame(gameToDelete.gameId);
      dispatch({
        type: 'SET_GAMES',
        payload: games.filter(g => g.gameId !== gameToDelete.gameId)
      });
      if (selectedGame?.gameId === gameToDelete.gameId) {
        dispatch({ type: 'SELECT_GAME', payload: null });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      setIsDeleteModalOpen(false);
      setGameToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="game-creator">
      <div className="game-creator-header">
        <h1>Game Creator</h1>
        <button onClick={handleCreateNewGame}>Create New Game</button>
      </div>

      {showGameForm && (
        <GameForm
          gameData={newGameData}
          onSave={handleSaveGame}
          onCancel={() => setShowGameForm(false)}
          isEditing={isEditing}
        />
      )}

      {!showGameForm && (
        <GameList
          onGameSelect={handleGameSelect}
          onDeleteGame={handleDeleteGame}
        />
      )}

      {selectedGame && !showGameForm && (
        <div className="selected-game-container">
          <GameDisplay game={selectedGame} />
          <button onClick={() => setShowChallengeCreator(true)}>
            Add Challenge
          </button>
        </div>
      )}

      {showChallengeCreator && (
        <ChallengeCreator
          game={selectedGame}
          challenge={currentChallenge}
          onClose={() => {
            setShowChallengeCreator(false);
            setCurrentChallenge(null);
          }}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete this game?</p>
        <div className="modal-buttons">
          <button onClick={confirmDeleteGame}>Yes, Delete</button>
          <button onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default GameCreator;
