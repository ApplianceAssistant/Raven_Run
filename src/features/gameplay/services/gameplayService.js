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
    const url = `${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`;
    const response = await authFetch(url);
    
    // Get the raw text first
    const rawText = await response.text();
    
    // Try to parse it as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', rawText);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }

    if (!response.ok || jsonData.status === 'error') {
      const errorMsg = jsonData?.message || 'Failed to fetch game from server';
      throw new Error(`Server returned ${response.status}: ${errorMsg}`);
    }

    const data = jsonData.data || jsonData;
    const game = data.game;

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
      creator_name: game.creator_name || 'Anonymous',
      image_url: game.image_url || '',
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
      console.log("return local game");
      return localGame;
    }

    // If not in local storage, fetch from server but don't save
    const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch game');
    }
    
    // Get the raw text first
    const rawText = await response.text();
    
    // Try to parse it as JSON
    let returnData;
    try {
      returnData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse text:', rawText);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }
    

    if (returnData.status === 'error') {
      throw new Error(returnData.message || 'Failed to fetch game data');
    }

    // Return the game data without saving to localStorage
    return returnData.game || returnData;
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
