// src/services/gameCreatorService.ts
import { getGamesFromLocalStorage, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../utils/localStorageUtils';
import { checkServerConnectivity, API_URL, authFetch  } from '../utils/utils.js';

export namespace GameTypes {
  export interface Game {
    id: number;
    server_id?: number;  // Server-generated ID
    name: string;
    description: string;
    challenges: Challenge[];
    public: boolean;
    gameId: string; // New property for the unique game ID
  }

  export interface Challenge {
    id: string;
    type: string;
    title: string;
    // Add other challenge properties as needed
  }
}

// Function to generate a unique game ID
export const generateUniqueGameId = async (length: number = 12): Promise<string> => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let isUnique = false;
  let generatedGameId = '';

  while (!isUnique) {
    generatedGameId = Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');

    try {
      const response = await authFetch(`${API_URL}/api/games.php?action=check_game_id&game_id=${generatedGameId}`);
      console.log("response: ", response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: { isUnique: boolean } = await response.json();
      isUnique = data.isUnique;
    } catch (error) {
      console.error('Error checking game_id uniqueness:', error);
      // If there's an error, we'll assume it's unique to avoid an infinite loop
      isUnique = true;
      return generatedGameId;
    }
  }

  return generatedGameId;
};

export const saveGame = async (game: GameTypes.Game): Promise<void> => {
  let gameId = game.gameId;
  
  if (!gameId) {
    gameId = await generateUniqueGameId();
  }

  const gameWithPublic: GameTypes.Game = { 
    ...game, 
    public: game.public ?? false,
    gameId: gameId
  };
  
  const isServerReachable = (await checkServerConnectivity()).isConnected;

  if (isServerReachable) {
    try {
      const payload = {
        action: 'save_game',
        game: {
          server_id: game.server_id,
          local_id: game.id,
          name: gameWithPublic.name,
          description: gameWithPublic.description,
          is_public: gameWithPublic.public ? 1 : 0,
          game_id: gameWithPublic.gameId,
          challenges: JSON.stringify(gameWithPublic.challenges)
        }
      };
      console.log('Sending payload:', payload);

      const response = await authFetch(`${API_URL}/api/games.php`, {
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

      // Update the game with the server-generated ID
      if (data.server_id) {
        gameWithPublic.server_id = data.server_id;
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
      const response = await authFetch(`${API_URL}/api/games.php`, {
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
      const response = await authFetch(`${API_URL}/api/games.php?action=get_games`);
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response status text:', response.statusText);
        throw new Error(`Failed to fetch games from server: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      
      try {
        const rawGames = JSON.parse(responseText);
        const serverGames = rawGames.map((game: any) => ({
          id: game.local_id || Date.now(),
          server_id: game.server_id,
          name: game.name,
          description: game.description,
          challenges: JSON.parse(game.challenge_data || '[]'),
          public: game.is_public === 1,
          gameId: game.game_id || ''
        }));

        // Only update local storage, don't trigger immediate syncs
        serverGames.forEach(saveGameToLocalStorage);

        return serverGames;
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return getGamesFromLocalStorage();
      }
    } catch (error) {
      console.error("Error in getGames:", error);
      return getGamesFromLocalStorage();
    }
  } else {
    console.log("Server not reachable, using local storage");
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