import { 
  getGamesFromLocalStorage, 
  saveGameToLocalStorage, 
  deleteGameFromLocalStorage 
} from '../../../utils/localStorageUtils';
import { 
  checkServerConnectivity, 
  API_URL, 
  authFetch 
} from '../../../utils/utils';
import { GameTypes } from '../types/gameTypes';

/**
 * @typedef {import('../types/gameTypes').Game} Game
 * @typedef {import('../types/gameTypes').Challenge} Challenge
 */

export const generateUniqueGameId = async () => {
  console.log('=== Starting generateUniqueGameId ===');
  const length = 12;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let gameId = '';

  // Generate initial ID
  const tempArray = new Array(length);
  for (let i = 0; i < length; i++) {
    tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
  }
  gameId = tempArray.join('');
  console.log('1. Initial gameId generation:', gameId, 'Length:', gameId.length);

  // Check uniqueness
  let isUnique = false;
  try {
    const isConnected = (await checkServerConnectivity()).isConnected;
    console.log('2. Server connectivity:', isConnected);

    if (isConnected) {
      console.log('3. Checking with server for:', gameId);
      const response = await authFetch(`${API_URL}/api/games.php?action=check_gameId&gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        isUnique = data.isUnique;
        console.log('4. Server response - isUnique:', isUnique);
      } else {
        throw new Error('Server response not ok');
      }
    } else {
      console.log('3. Offline - checking local storage');
      isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
      console.log('4. Local storage check - isUnique:', isUnique);
    }
  } catch (error) {
    console.error('Error during uniqueness check:', error);
    // Fallback to local storage check
    isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
    console.log('4. Fallback local storage check - isUnique:', isUnique);
  }

  // If not unique or wrong length, generate new ID
  while (!isUnique || gameId.length !== length) {
    console.log('5. Generating new ID - current not valid. Length:', gameId.length, 'isUnique:', isUnique);
    
    // Generate new ID
    for (let i = 0; i < length; i++) {
      tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
    }
    gameId = tempArray.join('');
    console.log('6. New gameId generated:', gameId, 'Length:', gameId.length);
    
    // Check uniqueness again
    isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
  }

  console.log('=== Final gameId:', gameId, 'Length:', gameId.length, '===');
  return gameId;
};

export const isValidGame = (game) => {
  return game.name && game.name.trim() !== '' &&
         game.description && game.description.trim() !== '';
};

export const saveGame = async (gameData) => {
  if (!isValidGame(gameData)) {
    throw new Error('Invalid game data');
  }
  
  if (!gameData.gameId) {
    gameData.gameId = await generateUniqueGameId();
  }

  try {
    // First save to local storage
    await saveGameToLocalStorage(gameData);

    // Try to sync with server if online
    const isConnected = (await checkServerConnectivity()).isConnected;
    if (isConnected) {
      const response = await authFetch(`${API_URL}/api/games.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_game',
          game: gameData
        })
      });

      if (response.ok) {
        // Update isSynced flag in local storage
        gameData.isSynced = true;
        await saveGameToLocalStorage(gameData);
      } else {
        gameData.isSynced = false;
        await saveGameToLocalStorage(gameData);
        console.warn('Failed to sync game with server');
      }
    } else {
      gameData.isSynced = false;
      await saveGameToLocalStorage(gameData);
    }
    
    return gameData;
  } catch (error) {
    console.error('Error saving game:', error);
    // Ensure local storage save even if server sync fails
    gameData.isSynced = false;
    await saveGameToLocalStorage(gameData);
    return gameData;
  }
};

export const getGames = async () => {
  return await getGamesFromLocalStorage();
};

export const deleteGame = async (gameId) => {
  await deleteGameFromLocalStorage(gameId);
};
