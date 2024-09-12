// src/services/gameCreatorService.ts
import { getGamesFromLocalStorage, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';

export namespace GameTypes {
  export interface Game {
    id: number;
    name: string;
    description: string;
    challenges: Challenge[];
  }

  export interface Challenge {
    id: string;
    type: string;
    title: string;
    // Add other challenge properties as needed
  }
}

export const saveGame = (game: GameTypes.Game): void => {
  saveGameToLocalStorage(game);
};

export const getGames = (): GameTypes.Game[] => {
  return getGamesFromLocalStorage();
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