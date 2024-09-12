// Define and export types
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

const SECRET_KEY = 'your-secret-key'; // Replace with a secure key

// Simple XOR encryption/decryption function
const xorEncryptDecrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

export const encryptData = (data: GameTypes.Game[]): string => {
  const jsonString = JSON.stringify(data);
  return btoa(xorEncryptDecrypt(jsonString, SECRET_KEY));
};

export const decryptData = (encryptedData: string): GameTypes.Game[] => {
  const decrypted = xorEncryptDecrypt(atob(encryptedData), SECRET_KEY);
  return JSON.parse(decrypted) as GameTypes.Game[];
};

export const saveGame = (game: GameTypes.Game): void => {
  const games = getGames();
  const updatedGames = [...games, game];
  localStorage.setItem('games', encryptData(updatedGames));
};

export const getGames = (): GameTypes.Game[] => {
  const encryptedGames = localStorage.getItem('games');
  return encryptedGames ? decryptData(encryptedGames) : [];
};

export const deleteGame = (gameId: number): void => {
  const games = getGames();
  const updatedGames = games.filter(game => game.id !== gameId);
  localStorage.setItem('games', encryptData(updatedGames));
};

export const getCharacterCount = (text: string, maxLength: number): number => {
  const remainingChars = maxLength - text.length;
  return remainingChars >= 0 ? remainingChars : 0;
};

export const isValidGame = (game: GameTypes.Game): boolean => {
  return Boolean(game.name && game.name.trim() !== '');
};