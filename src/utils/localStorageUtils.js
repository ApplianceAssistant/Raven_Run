// src/utils/localStorageUtils.js
/**
 * @typedef {import('../features/gameCreation/types/gameTypes').Game} Game
 * @typedef {import('../features/gameCreation/types/gameTypes').Challenge} Challenge
 */

import { encryptData, decryptData } from './encryption';

const CUSTOM_GAMES_KEY = 'Custom_Games';
const DOWNLOADED_GAMES_KEY = 'Downloaded_Games';
const DEBUG_STORAGE_KEY = 'Debug_Custom_Games';

/**
 * @returns {Game[]}
 */
export const getGamesFromLocalStorage = () => {
  try {
    // Try encrypted storage
    const encryptedGames = localStorage.getItem(CUSTOM_GAMES_KEY);
    if (!encryptedGames) {
      console.warn("No games found in localStorage");
      return [];
    }

    const games = decryptData(encryptedGames);
    if (!games || !Array.isArray(games)) {
      console.warn('Invalid games data format or decryption failed');
      return [];
    }

    return games
      .filter(game => game && typeof game === 'object' && (game.gameId || game.game_id))
      .map(game => normalizeGame(game));
  } catch (error) {
    console.error('Error getting games from localStorage:', error);
    return [];
  }
};

/**
 * Get a downloaded game by ID
 * @param {string} gameId 
 * @returns {Game|null}
 */
export const getDownloadedGame = (gameId) => {
  try {
    const downloadedGames = JSON.parse(localStorage.getItem(DOWNLOADED_GAMES_KEY) || '{}');
    const game = downloadedGames[gameId];
    return game ? normalizeGame(game) : null;
  } catch (error) {
    console.error('Error getting downloaded game:', error);
    return null;
  }
};

/**
 * Save a game to downloaded games storage
 * @param {Game} game 
 */
export const saveDownloadedGame = (game) => {
  try {
    const downloadedGames = JSON.parse(localStorage.getItem(DOWNLOADED_GAMES_KEY) || '{}');
    downloadedGames[game.gameId] = {
      ...normalizeGame(game),
      downloaded_at: new Date().toISOString(),
      last_played: new Date().toISOString()
    };
    localStorage.setItem(DOWNLOADED_GAMES_KEY, JSON.stringify(downloadedGames));
    return true;
  } catch (error) {
    console.error('Error saving downloaded game:', error);
    return false;
  }
};

/**
 * Update last played time for a downloaded game
 * @param {string} gameId 
 */
export const updateGameLastPlayed = (gameId) => {
  try {
    const downloadedGames = JSON.parse(localStorage.getItem(DOWNLOADED_GAMES_KEY) || '{}');
    if (downloadedGames[gameId]) {
      downloadedGames[gameId].last_played = new Date().toISOString();
      localStorage.setItem(DOWNLOADED_GAMES_KEY, JSON.stringify(downloadedGames));
    }
  } catch (error) {
    console.error('Error updating game last played:', error);
  }
};

/**
 * Remove a game from downloaded games
 * @param {string} gameId 
 */
export const removeDownloadedGame = (gameId) => {
  try {
    const downloadedGames = JSON.parse(localStorage.getItem(DOWNLOADED_GAMES_KEY) || '{}');
    delete downloadedGames[gameId];
    localStorage.setItem(DOWNLOADED_GAMES_KEY, JSON.stringify(downloadedGames));
    return true;
  } catch (error) {
    console.error('Error removing downloaded game:', error);
    return false;
  }
};

/**
 * Get all downloaded games
 * @returns {Game[]}
 */
export const getAllDownloadedGames = () => {
  try {
    const downloadedGames = JSON.parse(localStorage.getItem(DOWNLOADED_GAMES_KEY) || '{}');
    return Object.values(downloadedGames).map(game => normalizeGame(game));
  } catch (error) {
    console.error('Error getting all downloaded games:', error);
    return [];
  }
};

/**
 * Normalizes a game object to ensure consistent structure
 * @param {Object} game - Game object from either server or local storage
 * @returns {Game} - Normalized game object
 */
export const normalizeGame = (game) => {
  if (!game) return null;

  let challenges = [];
  if (game.challenge_data) {
    try {
      challenges = JSON.parse(game.challenge_data);
    } catch (e) {
      console.error('Error parsing challenge_data:', e);
    }
  } else if (Array.isArray(game.challenges)) {
    challenges = game.challenges;
  }

  return {
    gameId: game.gameId || game.game_id || '',
    name: game.name || '',
    description: game.description || '',
    public: game.public ?? game.is_public ?? false,
    isSynced: game.isSynced ?? true,
    challenges: challenges,
    lastModified: game.lastModified || game.last_modified || Date.now(),
    lastAccessed: Date.now()
  };
};

/**
 * @param {Game|Game[]} gameData
 */
export const saveGameToLocalStorage = async (gameData) => {
  try {
    const games = getGamesFromLocalStorage();
    const gamesArray = Array.isArray(gameData) ? gameData : [gameData];
    
    // Normalize and merge games
    for (const game of gamesArray) {
      const normalizedGame = normalizeGame(game);
      if (!normalizedGame) continue;

      const index = games.findIndex(g => g.gameId === normalizedGame.gameId);
      if (index !== -1) {
        games[index] = normalizedGame;
      } else {
        games.push(normalizedGame);
      }
    }

    // Remove old games if we exceed storage limit
    const MAX_STORED_GAMES = 20;
    if (games.length > MAX_STORED_GAMES) {
      games.sort((a, b) => b.lastAccessed - a.lastAccessed);
      games.length = MAX_STORED_GAMES;
    }

    // Save to debug storage first (unencrypted)
    //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));

    // Then save encrypted version
    const encryptedGames = await encryptData(games);
    if (encryptedGames) {
      localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);
      console.log('Games saved successfully:', games);
    }
  } catch (error) {
    console.error('Error saving games to localStorage:', error);
  }
};

/**
 * @param {number} gameId
 * @param {Challenge} updatedChallenge
 */
export const updateChallengeInLocalStorage = (gameId, updatedChallenge) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.map(game => {
    if (game.gameId === gameId) {
      const updatedChallenges = game.challenges.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      );
      return { ...game, challenges: updatedChallenges };
    }
    return game;
  });
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);

  // Update debug storage
  //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

/**
 * @param {number} gameId
 */
export const deleteGameFromLocalStorage = (gameId) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.filter(game => game.gameId !== gameId);
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);

  // Update debug storage
  //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

export const clearGamesFromLocalStorage = () => {
  try {
    localStorage.removeItem(CUSTOM_GAMES_KEY);
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing games from localStorage:', error);
  }
};