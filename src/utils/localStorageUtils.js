// src/utils/localStorageUtils.js
/**
 * @typedef {import('../features/gameCreation/types/gameTypes').Game} Game
 * @typedef {import('../features/gameCreation/types/gameTypes').Challenge} Challenge
 */

const GAME_STORAGE_KEY = 'Custom_Games';
const DEBUG_STORAGE_KEY = 'Debug_Custom_Games';
const SECRET_KEY = 'your-secret-key';

// Simple XOR encryption/decryption function
const xorEncryptDecrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

export const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  return btoa(xorEncryptDecrypt(jsonString, SECRET_KEY));
};

export const decryptData = (encryptedData) => {
  const decrypted = xorEncryptDecrypt(atob(encryptedData), SECRET_KEY);
  return JSON.parse(decrypted);
};

/**
 * @param {Game} game
 */
export const saveGameToLocalStorage = (game) => {
  const games = getGamesFromLocalStorage();
  let gameIndex = games.findIndex(g => g.gameId === game.gameId);
  
  if (gameIndex !== -1) {
    // Update existing game
    games[gameIndex] = {
      ...games[gameIndex],
      ...game,
      public: game.public ?? false,
      isSynced: game.isSynced ?? false
    };
  } else {
    // Add new game
    games.push({
      ...game,
      public: game.public ?? false,
      isSynced: game.isSynced ?? false
    });
  }

  const encryptedGames = encryptData(games);
  localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);
  localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));
};

/**
 * @returns {Game[]}
 */
export const getGamesFromLocalStorage = () => {
  const encryptedGames = localStorage.getItem(GAME_STORAGE_KEY);
  if (encryptedGames === null) {
    return [];
  }
  try {
    const games = decryptData(encryptedGames);
    if (!Array.isArray(games)) {
      console.error('Invalid games data format');
      return [];
    }
    return games.map((game, index) => ({
      ...game,
      public: game.public ?? false,
      isSynced: game.isSynced ?? false
    }));
  } catch (error) {
    console.error('Error decrypting games:', error);
    return [];
  }
};

export const getDebugGamesFromLocalStorage = () => {
  try {
    const debugGames = localStorage.getItem(DEBUG_STORAGE_KEY);
    if (debugGames === null) {
      return [];
    }
    return JSON.parse(debugGames);
  } catch (error) {
    console.error('Error getting debug games from localStorage:', error);
    return [];
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
  localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);

  // Update debug storage
  localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

/**
 * @param {number} gameId
 */
export const deleteGameFromLocalStorage = (gameId) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.filter(game => game.gameId !== gameId);
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);

  // Update debug storage
  localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

export const clearGamesFromLocalStorage = () => {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing games from localStorage:', error);
  }
};