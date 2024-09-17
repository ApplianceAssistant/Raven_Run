// src/services/gameCreatorService.ts
import { getGamesFromLocalStorage, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';

export namespace GameTypes {
  export interface Game {
    id: number;
    name: string;
    description: string;
    challenges: Challenge[];
    public: boolean;
  }

  export interface Challenge {
    id: string;
    type: string;
    title: string;
    // Add other challenge properties as needed
  }
}

export const saveGame = (game: GameTypes.Game): void => {
  const gameWithPublic: GameTypes.Game = { ...game, public: game.public ?? false };
  console.warn("save Game: ", game);
  saveGameToLocalStorage(gameWithPublic);
};

export const getGames = (): GameTypes.Game[] => {
  const games = getGamesFromLocalStorage();
  return games.map(game => ({ ...game, public: game.public ?? false }));
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