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
  let game_id = '';

  // Generate initial ID
  const tempArray = new Array(length);
  for (let i = 0; i < length; i++) {
    tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
  }
  game_id = tempArray.join('');
  console.log('1. Initial game_id generation:', game_id, 'Length:', game_id.length);

  // Check uniqueness
  let isUnique = false;
  try {
    const isConnected = (await checkServerConnectivity()).isConnected;
    console.log('2. Server connectivity:', isConnected);

    if (isConnected) {
      console.log('3. Checking with server for:', game_id);
      const response = await authFetch(`${API_URL}/api/games.php?action=check_game_id&game_id=${game_id}`);
      if (response.ok) {
        const data = await response.json();
        isUnique = data.isUnique;
        console.log('4. Server response - isUnique:', isUnique);
      } else {
        throw new Error('Server response not ok');
      }
    } else {
      console.log('3. Offline - checking local storage');
      isUnique = !getGamesFromLocalStorage().some(game => game.game_id === game_id);
      console.log('4. Local storage check - isUnique:', isUnique);
    }
  } catch (error) {
    console.error('Error during uniqueness check:', error);
    // Fallback to local storage check
    isUnique = !getGamesFromLocalStorage().some(game => game.game_id === game_id);
    console.log('4. Fallback local storage check - isUnique:', isUnique);
  }

  // If not unique or wrong length, generate new ID
  while (!isUnique || game_id.length !== length) {
    console.log('5. Generating new ID - current not valid. Length:', game_id.length, 'isUnique:', isUnique);
    
    // Generate new ID
    for (let i = 0; i < length; i++) {
      tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
    }
    game_id = tempArray.join('');
    console.log('6. New game_id generated:', game_id, 'Length:', game_id.length);
    
    // Check uniqueness again
    isUnique = !getGamesFromLocalStorage().some(game => game.game_id === game_id);
  }

  console.log('=== Final game_id:', game_id, 'Length:', game_id.length, '===');
  return game_id;
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
  
  await saveGameToLocalStorage(gameData);
  return gameData;
};

export const getGames = async () => {
  return await getGamesFromLocalStorage();
};

export const deleteGame = async (gameId) => {
  await deleteGameFromLocalStorage(gameId);
};
