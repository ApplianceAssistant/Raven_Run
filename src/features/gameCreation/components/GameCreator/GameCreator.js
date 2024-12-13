import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGameCreation } from '../../context/GameCreationContext';
import GameList from '../GameList/GameList';
import GameForm from '../GameForm/GameForm';
import ChallengeManager from '../ChallengeManager/ChallengeManager';
import Modal from '../../../../components/Modal';
import { generateUniqueGameId, saveGame, deleteGame, getGames } from '../../services/gameCreatorService';
import '../../../../css/GameCreator.scss';

const GameCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { game_id } = useParams();
  const { state, dispatch } = useGameCreation();
  const { games = [], selectedGame = null, isLoading = false, error = null } = state || {};
  
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGameData, setNewGameData] = useState({ 
    name: '', 
    description: '', 
    public: false, 
    game_id: '', 
    challenges: [] 
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  const isChallengesRoute = location.pathname.includes('/challenges');

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

  useEffect(() => {
    if (game_id) {
      const game = games.find(g => g.game_id === game_id);
      if (game) {
        dispatch({ type: 'SELECT_GAME', payload: game });
        setNewGameData({
          ...game,
          name: game.name || '',
          description: game.description || '',
          public: game.public ?? false,
          game_id: game.game_id,
          challenges: game.challenges || []
        });
      }
    }
  }, [game_id, games, dispatch]);

  const handleGameSelect = (game) => {
    navigate(`/create/edit/${game.game_id}`);
  };

  const handleCreateNewGame = async () => {
    console.log('Starting handleCreateNewGame');
    const game_id = await generateUniqueGameId();
    console.log('Received game_id from generateUniqueGameId:', game_id, 'Length:', game_id.length);
    
    const newGame = { 
      name: '', 
      description: '', 
      public: false, 
      game_id, 
      challenges: [] 
    };
    console.log('Created newGame object:', newGame);
    
    setNewGameData(newGame);
    console.log('Set newGameData:', newGame);
    
    navigate('/create/new');
  };

  const handleSaveGame = async (gameData) => {
    console.log('Starting handleSaveGame with gameData:', gameData);
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const savedGame = await saveGame(gameData);
      console.log('Game saved, returned data:', savedGame);
      
      const updatedGames = games.map(g => 
        g.game_id === savedGame.game_id ? savedGame : g
      );
      
      if (!games.find(g => g.game_id === savedGame.game_id)) {
        updatedGames.push(savedGame);
      }
      
      dispatch({ type: 'SET_GAMES', payload: updatedGames });
      setShowGameForm(false);
      navigate(`/create/edit/${savedGame.game_id}`);
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
      await deleteGame(gameToDelete.game_id);
      dispatch({
        type: 'SET_GAMES',
        payload: games.filter(g => g.game_id !== gameToDelete.game_id)
      });
      if (selectedGame?.game_id === gameToDelete.game_id) {
        dispatch({ type: 'SELECT_GAME', payload: null });
        navigate('/create');
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
      {!game_id && !location.pathname.includes('/new') ? (
        <>
          <div className="game-creator-header">
            <h1>Game Creator</h1>
            <button onClick={handleCreateNewGame}>Create New Game</button>
          </div>

          <GameList
            games={games}
            onGameSelect={handleGameSelect}
            onDeleteGame={handleDeleteGame}
          />
        </>
      ) : isChallengesRoute ? (
        <ChallengeManager
          game={selectedGame || newGameData}
          onSave={handleSaveGame}
        />
      ) : location.pathname === '/create/new' ? (
        <GameForm
          gameData={newGameData}
          onSave={handleSaveGame}
          onCancel={() => {
            setShowGameForm(false);
            navigate('/create');
          }}
          isEditing={false}
        />
      ) : (
        <GameForm
          gameData={selectedGame || {
            ...newGameData,
            game_id: game_id,
            challenges: selectedGame?.challenges || []
          }}
          onSave={handleSaveGame}
          onCancel={() => navigate('/create')}
          isEditing={true}
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
