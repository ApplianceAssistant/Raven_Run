import { 
  getDownloadedGame, 
  saveDownloadedGame, 
  updateGameLastPlayed,
  removeDownloadedGame,
  getAllDownloadedGames
} from '../../../utils/localStorageUtils';
import { API_URL, authFetch } from '../../../utils/utils';

/**
 * @typedef {import('../../gameCreation/types/gameTypes').Game} Game
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
      console.log('Game already downloaded:', gameId);
      return existingGame;
    }

    // Fetch from server
    const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get&gameId=${gameId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch game from server');
    }

    const game = await response.json();
    if (!game || !game.gameId) {
      throw new Error('Invalid game data received from server');
    }

    // Parse challenge data if it's a string
    if (typeof game.challenge_data === 'string') {
      try {
        game.challenges = JSON.parse(game.challenge_data);
      } catch (e) {
        console.error('Error parsing challenge data:', e);
        game.challenges = [];
      }
    }

    // Save to downloaded games
    const success = saveDownloadedGame(game);
    if (!success) {
      throw new Error('Failed to save game locally');
    }

    return game;
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
    // First try to load from downloaded games
    const downloadedGame = getDownloadedGame(gameId);
    if (downloadedGame) {
      updateGameLastPlayed(gameId);
      return downloadedGame;
    }

    // If not found locally, try to download it
    return await downloadGame(gameId);
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
