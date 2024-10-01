// src/utils/localStorageUtils.js
/**
 * @typedef {import('../services/gameCreatorService').GameTypes.Game} Game
 * @typedef {import('../services/gameCreatorService').GameTypes.Challenge} Challenge
 */

const GAME_STORAGE_KEY = 'Custom_Games';
const DEBUG_STORAGE_KEY = 'Debug_Custom_Games';
const SECRET_KEY = 'hf$se8_6y43uuF-7';

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
  const updatedGames = games.map(g => g.path_id === game.path_id ? { ...g, ...game, public: game.public } : g);
  if (!updatedGames.some(g => g.path_id === game.path_id)) {
    updatedGames.push({ ...game, public: game.public ?? false });
  }
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);

  // Save unencrypted version for debugging
  localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

/**
 * @returns {Game[]}
 */
export const getGamesFromLocalStorage = () => {
  const encryptedGames = localStorage.getItem(GAME_STORAGE_KEY);
  if (encryptedGames === null) {
    return [];
  }
  const games = decryptData(encryptedGames);
  return games.map(game => ({
    ...game,
    public: typeof game.public === 'boolean' ? game.public : false
  }));
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
export const updateChallengeInLocalStorage = (pathId, updatedChallenge) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.map(game => {
    if (game.path_id === pathId) {
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
export const deleteGameFromLocalStorage = (pathId) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.filter(game => game.path_id !== pathId);
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