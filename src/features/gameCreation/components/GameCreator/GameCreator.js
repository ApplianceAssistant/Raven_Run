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
    title: '', 
    description: '', 
    isPublic: false, 
    gameId: '', 
    challenges: [],
    difficulty_level: 'medium',
    tags: [],
    dayOnly: false,
    gameSettings: {}
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
        dispatch({ type: 'SELECT_GAME', payload: game });
        setNewGameData({
          title: game.title || '',
          description: game.description || '',
          isPublic: game.isPublic ?? false,
          gameId: game.gameId,
          challenges: game.challenges || [],
          difficulty_level: game.difficulty_level || 'medium',
          tags: game.tags || [],
          dayOnly: game.dayOnly || false,
          gameSettings: game.gameSettings || {}
        });
      } else {
        navigate('/create');
      }
    }
  }, [gameId, games, dispatch, navigate]);

  const handleGameSelect = (game) => {
    dispatch({ type: 'SELECT_GAME', payload: game });
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleCreateNewGame = async () => {
    const gameId = await generateUniqueGameId();
    
    const newGame = { 
      title: '', 
      description: '', 
      isPublic: false, 
      gameId, 
      challenges: [],
      difficulty_level: 'medium',
      tags: [],
      dayOnly: false,
      gameSettings: {}
    };
    
    setNewGameData(newGame);
    
    navigate('/create/new');
  };

  const validateGameData = (gameData) => {
    const errors = [];
    if (!gameData.title?.trim()) errors.push('Game name is required');
    if (!gameData.description?.trim()) errors.push('Game description is required');
    return errors;
  };

  const handleSaveGame = async (gameData) => {
    try {
      // Validate required fields
      const validationErrors = validateGameData(gameData);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid game data: ${validationErrors.join(', ')}`);
      }

      // Find the existing game to preserve its challenges and image
      const existingGame = games.find(g => g.gameId === gameData.gameId);
      
      // Ensure challenges array is valid
      const existingChallenges = existingGame?.challenges || [];
      const newChallenges = gameData.challenges || [];
      const mergedChallenges = existingGame 
        ? existingChallenges.map(challenge => ({
            ...challenge,
            // Preserve existing challenge data
            ...(newChallenges.find(nc => nc.id === challenge.id) || {})
          }))
        : newChallenges;

      const newGame = {
        gameId: gameData.gameId,
        title: gameData.title.trim(),
        description: gameData.description.trim(),
        isPublic: gameData.isPublic ?? false,
        difficulty_level: gameData.difficulty_level || 'medium',
        tags: gameData.tags || [],
        dayOnly: gameData.dayOnly || false,
        challenges: mergedChallenges,
        isSynced: false,
        lastModified: new Date().toISOString(),
        // Preserve gameSettings
        gameSettings: gameData.gameSettings || existingGame?.gameSettings || {},
        // Only preserve existing image_url if image wasn't explicitly deleted
        image_url: gameData.imageDeleted ? '' : (gameData.image_url || existingGame?.image_url || '')
      };
      
      // Attempt to save to server first
      let savedGame;
      try {
        savedGame = await saveGame(newGame);
        newGame.isSynced = true;
        // Ensure we preserve the image_url from server response
        if (savedGame.image_url) {
          newGame.image_url = savedGame.image_url;
        }
      } catch (syncError) {
        console.error('Failed to sync with server:', syncError);
        savedGame = newGame; // Use local data as fallback
      }
      
      // Update games array, replacing the existing game if it exists
      const updatedGames = existingGame 
        ? games.map(g => g.gameId === savedGame.gameId ? savedGame : g)
        : [...games, savedGame];
        
      dispatch({ type: 'SET_GAMES', payload: updatedGames });
      setShowGameForm(false);
      navigate(`/create/edit/${savedGame.gameId}`);
    } catch (error) {
      console.error('Error in handleSaveGame:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleEditGame = (gameId) => {
    const game = games.find(g => g.gameId === gameId);
    if (game) {
      dispatch({ type: 'SELECT_GAME', payload: game });
      navigate(`/create/edit/${gameId}`);
    }
  };

  const handleChallenges = (gameId) => {
    const game = games.find(g => g.gameId === gameId);
    if (game) {
      dispatch({ type: 'SELECT_GAME', payload: game });
      navigate(`/create/edit/${gameId}/challenges`);
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

  const handleGameUpdate = async (updatedGame) => {
    try {
      await saveGame(updatedGame);
      dispatch({ type: 'SELECT_GAME', payload: updatedGame });
      const updatedGames = games.map(g => 
        g.gameId === updatedGame.gameId ? updatedGame : g
      );
      dispatch({ type: 'SET_GAMES', payload: updatedGames });
    } catch (error) {
      console.error('[GameCreator] Error updating game:', error);
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
            onChallenges={handleChallenges}
          />
        </>
      ) : isChallengeCreatorRoute ? (
        <ChallengeCreator
          gameData={selectedGame}
          onSave={handleGameUpdate}
        />
      ) : isChallengesRoute ? (
        <ChallengeManager />
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
