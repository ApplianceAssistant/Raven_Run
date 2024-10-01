// src/services/gameCreatorService.ts
import { getGamesFromLocalStorage, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';
import { checkServerConnectivity, API_URL } from '../utils/utils.js';

export namespace GameTypes {
  export interface Game {
    id: number;
    server_id?: number;  // Server-generated ID
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

export const saveGame = async (game: GameTypes.Game): Promise<void> => {
  const gameWithPublic: GameTypes.Game = { 
    ...game, 
    public: game.public ?? false,
    pathId: game.pathId || generateUniquePathId()
  };
  
  const isServerReachable = (await checkServerConnectivity()).isConnected;

  if (isServerReachable) {
    try {

      const payload = {
        action: 'save_game',
          game: {
            server_id: game.server_id, // Use server_id instead of id
            local_id: game.id,         // Send the local ID for reference
            title: gameWithPublic.name,
            description: gameWithPublic.description,
            is_public: gameWithPublic.public ? 1 : 0,
            path_id: gameWithPublic.pathId,
            challenges: JSON.stringify(gameWithPublic.challenges)
          }
      };
      console.log('Sending payload:', payload);

      const response = await fetch(`${API_URL}/paths.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Full response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid response from server');
      }

      const result = await response.json();
      
      // Update the game with the server-generated ID
      if (result.server_id) {
        gameWithPublic.server_id = result.server_id;
        // Update local storage with the new server_id
        saveGameToLocalStorage(gameWithPublic);
      }
      
    } catch (error) {
      console.error("Failed to save game to server:", error);
      saveGameToLocalStorage(gameWithPublic);
    }
  } else {
    saveGameToLocalStorage(gameWithPublic);
  }
};

export const deleteGame = async (gameId: number): Promise<void> => {
  const isServerReachable = (await checkServerConnectivity()).isConnected;

  if (isServerReachable) {
    try {
      const response = await fetch(`${API_URL}/paths.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_game',
          game_id: gameId
        })
      });
      if (!response.ok) throw new Error('Failed to delete game from server');
      
      // If delete from server is successful, also remove from local storage
      deleteGameFromLocalStorage(gameId);
    } catch (error) {
      console.error("Failed to delete game from server:", error);
      // Keep the game in local storage if server delete fails
    }
  } else {
    // If offline, just remove from local storage
    console.error("Failed to delete game from server: Server is unreachable");
  }
};

export const getGames = async (): Promise<GameTypes.Game[]> => {
  const isServerReachable = (await checkServerConnectivity()).isConnected;

  if (isServerReachable) {
    try {
      const response = await fetch(`${API_URL}/paths.php?action=get_games`);
      if (!response.ok) throw new Error('Failed to fetch games from server');
      let serverGames: GameTypes.Game[] = await response.json();
      
      const localGames = getGamesFromLocalStorage();
      
      // Sync local games with server
      for (const localGame of localGames) {
        if (!serverGames.some(serverGame => serverGame.id === localGame.id)) {
          // This game doesn't exist on the server, so save it
          await saveGame(localGame);
          serverGames.push(localGame);
        }
      }

      // Remove games from server that were deleted locally
      for (const serverGame of serverGames) {
        if (!localGames.some(localGame => localGame.id === serverGame.id)) {
          // This game was deleted locally, so delete it from the server
          await deleteGame(serverGame.id);
          serverGames = serverGames.filter(game => game.id !== serverGame.id);
        }
      }

      // Update local storage with the final list of games
      serverGames.forEach(saveGameToLocalStorage);

      return serverGames.map(game => ({ 
        ...game, 
        public: game.public ?? false,
        pathId: game.pathId || generateUniquePathId()
      }));
    } catch (error) {
      console.error("Failed to fetch games from server:", error);
      return getGamesFromLocalStorage();
    }
  } else {
    return getGamesFromLocalStorage();
  }
};

export const isValidGame = (game: GameTypes.Game): boolean => {
  return Boolean(game.name && game.name.trim() !== '');
};

export const getCharacterCount = (text: string, maxLength: number): number => {
  const remainingChars = maxLength - text.length;
  return remainingChars >= 0 ? remainingChars : 0;
};