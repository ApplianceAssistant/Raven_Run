import {
  API_URL,
  DOWNLOADED_GAMES_KEY,
  HUNT_PROGRESS_KEY,
  CURRENT_GAME_KEY,
  UNIT_PREFERENCE_KEY,
  THEME_KEY,
  SETTINGS_KEY,
  GAME_CREATOR_KEY,
  authFetch,
  calculateDistance 
} from '../../../utils/utils';

/**
 * @typedef {import('../../../types/games').Game} Game
 * @typedef {import('../../../types/challengeTypes').Challenge} Challenge
 */

/**
 * Calculate game location data from travel challenges
 * @param {Challenge[]} challenges - Array of game challenges
 * @returns {{
 *   startLat: number|null,
 *   startLong: number|null,
 *   endLat: number|null,
 *   endLong: number|null,
 *   distance: number|null
 * }} Location data for the game
 */
const calculateGameLocationData = (challenges) => {
  // Filter travel challenges with valid locations
  const locationChallenges = (challenges || []).filter(c => 
    c.type === 'travel' && 
    c.targetLocation?.latitude && 
    c.targetLocation?.longitude
  );

  // Default values
  const result = {
    startLat: null,
    startLong: null,
    endLat: null,
    endLong: null,
    distance: null
  };

  if (locationChallenges.length > 0) {
    // Sort challenges by order
    locationChallenges.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Get first and last locations
    const firstLocation = locationChallenges[0].targetLocation;
    const lastLocation = locationChallenges[locationChallenges.length - 1].targetLocation;
    
    // Set start and end coordinates
    result.startLat = parseFloat(firstLocation.latitude);
    result.startLong = parseFloat(firstLocation.longitude);
    result.endLat = parseFloat(lastLocation.latitude);
    result.endLong = parseFloat(lastLocation.longitude);
    
    // Calculate maximum distance between any two points
    if (locationChallenges.length >= 2) {
      let maxDistance = 0;
      for (let i = 0; i < locationChallenges.length; i++) {
        for (let j = i + 1; j < locationChallenges.length; j++) {
          const distance = calculateDistance(
            locationChallenges[i].targetLocation,
            locationChallenges[j].targetLocation
          );
          maxDistance = Math.max(maxDistance, distance);
        }
      }
      // Convert from meters to kilometers
      result.distance = maxDistance / 1000;
    } else {
      result.distance = 0;
    }
  }

  return result;
};

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
      const response = await authFetch(`${API_URL}/server/api/games/games.php?action=check_gameId&gameId=${gameId}`);
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
  return game.title && game.title.trim() !== '' &&
         game.description && game.description.trim() !== '';
};

export const saveGame = async (gameData) => {
  console.warn('saveGame called with gameData:', gameData);
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
      // Check if any travel challenges exist and validate their locations
      if (gameData.challenges) {
        const travelChallenges = gameData.challenges.filter(c => c.type === 'travel');
        const invalidLocations = travelChallenges.filter(c => 
          !c.targetLocation?.latitude || !c.targetLocation?.longitude
        );
        
        if (invalidLocations.length > 0) {
          throw new Error('One or more travel challenges have invalid location data');
        }
      }

      // Calculate location data
      const locationData = calculateGameLocationData(gameData.challenges);

      const apiGameData = {
        ...gameData,
        is_public: gameData.public,
        start_latitude: locationData.startLat,
        start_longitude: locationData.startLong,
        end_latitude: locationData.endLat,
        end_longitude: locationData.endLong,
        distance: locationData.distance
      };

      const response = await authFetch(`${API_URL}/server/api/games/games.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_game',
          game: apiGameData
        })
      });

      if (response.ok) {
        // Update isSynced flag in local storage
        gameData.isSynced = true;
        await saveGameToLocalStorage(gameData);
      } else {
        const errorData = await response.json();
        gameData.isSynced = false;
        await saveGameToLocalStorage(gameData);
        throw new Error(errorData.error || 'Failed to sync game with server');
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
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getGames = async () => {
  console.warn("getGames called");
  let games = getGamesFromLocalStorage() || [];
  
  try {
    const isConnected = (await checkServerConnectivity()).isConnected;
    if (isConnected) {
      const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get_games`);
      if (response.ok) {
        const serverGames = await response.json();
        console.warn("getGames - serverGames:", serverGames);
        
        if (!Array.isArray(serverGames)) {
          console.error('Invalid server games format');
          return games;
        }
        
        // Normalize server games and filter out any invalid ones
        const normalizedServerGames = serverGames
          .filter(game => game && typeof game === 'object' && (game.gameId || game.game_id || game.id))
          .map(game => normalizeGame(game));
        
        // Keep unsynced local games
        const unsynced = games.filter(localGame => {
          return !localGame.isSynced && localGame.gameId;
        });
        
        // Combine unsynced local games with server games
        const mergedGames = [...normalizedServerGames];
        unsynced.forEach(localGame => {
          if (!mergedGames.some(g => g.gameId === localGame.gameId)) {
            mergedGames.push(localGame);
          }
        });
        
        console.log('mergedGames:', mergedGames);
        // Update local storage with merged games
        if (mergedGames.length > 0) {
          saveGameToLocalStorage(mergedGames);
          games = mergedGames;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching games from server:', error);
  }
  
  return games.filter(game => game && game.gameId);
};

export const deleteGame = async (gameId) => {
  await deleteGameFromLocalStorage(gameId);
};
