// src/services/gameCreatorService.ts
import { getGamesFromLocalStorage, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';

export namespace GameTypes {
  export interface Game {
    id: number;
    name: string;
    description: string;
    challenges: Challenge[];
    public: boolean;
    pathId: string; // New property for the unique path ID
  }

  export interface Challenge {
    id: string;
    type: string;
    title: string;
    // Add other challenge properties as needed
  }
}

// Function to generate a unique path ID
export const generateUniquePathId = (length: number = 12): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const saveGame = (game: GameTypes.Game): void => {
  const gameWithPublic: GameTypes.Game = { 
    ...game, 
    public: game.public ?? false,
    pathId: game.pathId || generateUniquePathId() // Ensure pathId is set
  };
  console.warn("save Game: ", gameWithPublic);
  saveGameToLocalStorage(gameWithPublic);
};

export const getGames = (): GameTypes.Game[] => {
  const games = getGamesFromLocalStorage();
  return games.map(game => ({ 
    ...game, 
    public: game.public ?? false,
    pathId: game.pathId || generateUniquePathId() // Ensure all games have a pathId
  }));
};

export const deleteGame = (gameId: number): void => {
  deleteGameFromLocalStorage(gameId);
};

export const isValidGame = (game: GameTypes.Game): boolean => {
  return Boolean(game.name && game.name.trim() !== '');
};

export const getCharacterCount = (text: string, maxLength: number): number => {
  const remainingChars = maxLength - text.length;
  return remainingChars >= 0 ? remainingChars : 0;
};