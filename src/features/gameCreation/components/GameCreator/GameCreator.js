import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGameCreation } from '../../context/GameCreationContext';
import GameList from '../GameList/GameList';
import GameForm from '../GameForm/GameForm';
import ChallengeManager from '../ChallengeManager/ChallengeManager';
import ChallengeCreator from '../ChallengeCreator/ChallengeCreator';
import Modal from '../../../../components/Modal';
import { generateUniqueGameId, saveGame, deleteGame, getGames } from '../../services/gameCreatorService';
import '../../../../css/GameCreator.scss';

const GameCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { state, dispatch } = useGameCreation();
  const { games = [], selectedGame = null, isLoading = false, error = null } = state || {};
  
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGameData, setNewGameData] = useState({ 
    name: '', 
    description: '', 
    public: false, 
    gameId: '', 
    challenges: [] 
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  const isChallengesRoute = location.pathname.includes('/challenges');
  const isChallengeCreatorRoute = location.pathname.includes('/create/challenge/');

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
    if (gameId && games.length > 0) {
      const game = games.find(g => g.gameId === gameId);
      if (game) {
        console.log('Setting selected game:', game);
        dispatch({ type: 'SELECT_GAME', payload: game });
        setNewGameData({
          name: game.name || '',
          description: game.description || '',
          public: game.public ?? false,
          gameId: game.gameId,
          challenges: game.challenges || []
        });
      } else {
        console.warn('Game not found for ID:', gameId);
        navigate('/create');
      }
    }
  }, [gameId, games, dispatch, navigate]);

  const handleGameSelect = (game) => {
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleCreateNewGame = async () => {
    console.log('Starting handleCreateNewGame');
    const gameId = await generateUniqueGameId();
    console.log('Received gameId from generateUniqueGameId:', gameId, 'Length:', gameId.length);
    
    const newGame = { 
      name: '', 
      description: '', 
      public: false, 
      gameId, 
      challenges: [] 
    };
    console.log('Created newGame object:', newGame);
    
    setNewGameData(newGame);
    console.log('Set newGameData:', newGame);
    
    navigate('/create/new');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newGame = {
        name: newGameData.name,
        description: newGameData.description,
        public: newGameData.public,
        challenges: [],
        isSynced: false
      };
      
      const savedGame = await saveGame(newGame);
      
      dispatch({ type: 'SET_GAMES', payload: [...games, savedGame] });
      setShowGameForm(false);
      navigate(`/create/edit/${savedGame.gameId}`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleSaveGame = async (gameData) => {
    console.log('Starting handleSaveGame with gameData:', gameData);
    try {
      const newGame = {
        ...gameData,
        public: gameData.public ?? false,
        challenges: gameData.challenges ?? [],
        isSynced: false
      };
      
      const savedGame = await saveGame(newGame);
      
      dispatch({ type: 'SET_GAMES', payload: [...games, savedGame] });
      setShowGameForm(false);
      navigate(`/create/edit/${savedGame.gameId}`);
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
      {!gameId && !location.pathname.includes('/new') ? (
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
      ) : isChallengeCreatorRoute && selectedGame ? (
        <ChallengeCreator />
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
        />
      ) : (
        <GameForm
          gameData={selectedGame || {
            ...newGameData,
            gameId: gameId,
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
            content={`Are you sure you want to delete this game and all of its challenges?`}
            buttons={[
              {
                label: 'Yes, Delete',
                onClick: confirmDeleteGame,
                className: 'danger'
              },
              {
                label: 'Cancel',
                onClick: () => setIsDeleteModalOpen(false),
                className: 'secondary'
              }
            ]}
          />
    </div>
  );
};

export default GameCreator;
