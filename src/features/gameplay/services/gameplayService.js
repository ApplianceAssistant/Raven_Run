import { 
  getDownloadedGame, 
  saveDownloadedGame, 
  updateGameLastPlayed,
  removeDownloadedGame,
  getAllDownloadedGames
} from '../../../utils/localStorageUtils';
import { API_URL, authFetch } from '../../../utils/utils';

/**
 * @typedef {import('../../../types/games').Game} Game
 * @typedef {import('../../../types/challengeTypes').Challenge} Challenge
 */

/**
 * Download a game for offline play
 * @param {string} gameId 
 */
export const downloadGame = async (gameId) => {
  try {
    // First check if we already have it downloaded
    const existingGame = getDownloadedGame(gameId);
    if (existingGame) {
      return existingGame;
    }

    // Fetch from server
    const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`);
    
    // Log the raw response for debugging
    const rawText = await response.text();
    
    let game;
    try {
      game = JSON.parse(rawText);
    } catch (e) {
      console.error('Error parsing game JSON:', e);
      throw new Error('Failed to parse game data from server');
    }

    if (!response.ok) {
      const errorMsg = game?.message || 'Failed to fetch game from server';
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    // Handle both response formats (direct game object or {status, message, data})
    if (game.status === 'error') {
      throw new Error(game.message || 'Server returned an error');
    }

    // Normalize the game object
    const normalizedGame = {
      gameId: game.id || game.gameId,
      title: game.title,
      description: game.description,
      challenges: Array.isArray(game.challenges) ? game.challenges : 
                 (typeof game.challenge_data === 'string' ? JSON.parse(game.challenge_data) : []),
      isPublic: game.isPublic || game.is_public || false,
      difficulty: game.difficulty || game.difficulty_level || 'Normal',
      distance: parseFloat(game.distance) || 0,
      estimatedTime: parseInt(game.estimatedTime || game.estimated_time) || 60,
      tags: Array.isArray(game.tags) ? game.tags : [],
      dayOnly: Boolean(game.dayOnly || game.day_only),
      creator_name: game.creator_name || game.creatorName || 'Anonymous',
      startLocation: game.startLocation || {
        latitude: parseFloat(game.start_latitude || game.startLat) || 0,
        longitude: parseFloat(game.start_longitude || game.startLong) || 0
      },
      lastModified: Date.now(),
      lastAccessed: Date.now(),
      isSynced: true
    };

    // Ensure we have a valid game ID
    if (!normalizedGame.gameId) {
      throw new Error('Invalid game data: no game ID found');
    }

    // Save to downloaded games
    const success = saveDownloadedGame(normalizedGame);
    if (!success) {
      throw new Error('Failed to save game locally');
    }

    return normalizedGame;
  } catch (error) {
    console.error('Error downloading game:', error);
    throw error;
  }
};

/**
 * Load a game for play
 * @param {string} gameId 
 */
export const loadGame = async (gameId) => {
  try {
    // Check if game exists locally first
    const localGame = getDownloadedGame(gameId);
    if (localGame) {
      return localGame;
    }

    // If not in local storage, fetch from server but don't save
    const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`);
    console.log("loadGame - response:", response);
    
    if (!response.ok) {
      throw new Error('Failed to fetch game');
    }
    
    // Get the raw text first
    const rawText = await response.text();
    console.log("rawText:", rawText);
    
    // Try to parse it as JSON
    let gameData;
    try {
      gameData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', rawText);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }
    
    console.log("loadGame - parsed data:", gameData);

    if (gameData.status === 'error') {
      throw new Error(gameData.message || 'Failed to fetch game data');
    }

    // Return the game data without saving to localStorage
    return gameData.data || gameData;
  } catch (error) {
    console.error('Error loading game:', error);
    throw error;
  }
};

/**
 * Get all downloaded games
 * @returns {Promise<Game[]>}
 */
export const getDownloadedGames = async () => {
  return getAllDownloadedGames();
};

/**
 * Remove a downloaded game
 * @param {string} gameId 
 */
export const removeGame = async (gameId) => {
  return removeDownloadedGame(gameId);
};
