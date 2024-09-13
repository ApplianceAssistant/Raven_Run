// src/utils/localStorageUtils.js

const GAME_STORAGE_KEY = 'Custom_Games';
const DEBUG_STORAGE_KEY = 'Debug_Custom_Games';
const SECRET_KEY = 'your-secret-key'; // Replace with a secure key

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

export const saveGameToLocalStorage = (game) => {
  try {
    let games = getGamesFromLocalStorage();
    const index = games.findIndex(g => g.id === game.id);
    if (index !== -1) {
      games[index] = game;
    } else {
      games.push(game);
    }
    const encryptedGames = encryptData(games);
    localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);
    
    // Save unencrypted version for debugging
    localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('Error saving game to localStorage:', error);
  }
};

export const getGamesFromLocalStorage = () => {
  try {
    const encryptedGames = localStorage.getItem(GAME_STORAGE_KEY);
    if (encryptedGames === null) {
      return [];
    }
    return decryptData(encryptedGames);
  } catch (error) {
    console.error('Error getting games from localStorage:', error);
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

export const updateChallengeInLocalStorage = (gameId, challenge) => {
  try {
    const games = getGamesFromLocalStorage();
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex === -1) {
      throw new Error('No game found in localStorage');
    }
    
    const challengeIndex = games[gameIndex].challenges.findIndex(c => c.id === challenge.id);
    if (challengeIndex === -1) {
      games[gameIndex].challenges.push(challenge);
    } else {
      games[gameIndex].challenges[challengeIndex] = challenge;
    }
    
    const encryptedGames = encryptData(games);
    localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);
    
    // Update unencrypted version for debugging
    localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('Error updating challenge in localStorage:', error);
  }
};

export const deleteGameFromLocalStorage = (gameId) => {
  try {
    let games = getGamesFromLocalStorage();
    games = games.filter(game => game.id !== gameId);
    const encryptedGames = encryptData(games);
    localStorage.setItem(GAME_STORAGE_KEY, encryptedGames);
    
    // Update unencrypted version for debugging
    localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    console.error('Error deleting game from localStorage:', error);
  }
};

export const clearGamesFromLocalStorage = () => {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing games from localStorage:', error);
  }
};