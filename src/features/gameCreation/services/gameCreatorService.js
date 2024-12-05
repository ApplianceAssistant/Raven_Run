import { 
  saveGameToLocalStorage, 
  getGamesFromLocalStorage, 
  deleteGameFromLocalStorage 
} from '../../../utils/localStorageUtils';

export const generateUniqueGameId = async () => {
  const games = await getGames();
  let gameId;
  do {
    gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (games.some(game => game.gameId === gameId));
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
  
  await saveGameToLocalStorage(gameData);
  return gameData;
};

export const getGames = async () => {
  return await getGamesFromLocalStorage();
};

export const deleteGame = async (gameId) => {
  await deleteGameFromLocalStorage(gameId);
};
