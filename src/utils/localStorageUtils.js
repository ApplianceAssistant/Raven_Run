// src/utils/localStorageUtils.js

const GAME_STORAGE_KEY = 'ravenRunGame';

export const saveGameToLocalStorage = (game) => {
  try {
    const serializedGame = JSON.stringify(game);
    localStorage.setItem(GAME_STORAGE_KEY, serializedGame);
  } catch (error) {
    console.error('Error saving game to localStorage:', error);
  }
};

export const getGameFromLocalStorage = () => {
  try {
    const serializedGame = localStorage.getItem(GAME_STORAGE_KEY);
    if (serializedGame === null) {
      return null;
    }
    return JSON.parse(serializedGame);
  } catch (error) {
    console.error('Error getting game from localStorage:', error);
    return null;
  }
};

export const updateChallengeInLocalStorage = (challenge) => {
  try {
    const game = getGameFromLocalStorage();
    if (!game) {
      throw new Error('No game found in localStorage');
    }
    
    const challengeIndex = game.challenges.findIndex(c => c.id === challenge.id);
    if (challengeIndex === -1) {
      game.challenges.push(challenge);
    } else {
      game.challenges[challengeIndex] = challenge;
    }
    
    saveGameToLocalStorage(game);
  } catch (error) {
    console.error('Error updating challenge in localStorage:', error);
  }
};

export const clearGameFromLocalStorage = () => {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game from localStorage:', error);
  }
};