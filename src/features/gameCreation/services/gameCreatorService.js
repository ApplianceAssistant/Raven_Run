import {
  API_URL,
  checkServerConnectivity,
  authFetch,
  calculateDistance 
} from '../../../utils/utils';
import { getGamesFromLocalStorage, normalizeGame, saveGameToLocalStorage, deleteGameFromLocalStorage } from '../../../utils/localStorageUtils';
import { getPlaytestState, clearPlaytestState } from '../../../utils/localStorageUtils';

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
  const length = 12;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let gameId = '';

  // Generate initial ID
  const tempArray = new Array(length);
  for (let i = 0; i < length; i++) {
    tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
  }
  gameId = tempArray.join('');
  // Check uniqueness
  let isUnique = false;
  try {
    const isConnected = (await checkServerConnectivity()).isConnected;

    if (isConnected) {
      const response = await authFetch(`${API_URL}/server/api/games/games.php?action=check_gameId&gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        isUnique = data.isUnique;
      } else {
        throw new Error('Server response not ok');
      }
    } else {
      isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
    }
  } catch (error) {
    console.error('Error during uniqueness check:', error);
    // Fallback to local storage check
    isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
  }

  // If not unique or wrong length, generate new ID
  while (!isUnique || gameId.length !== length) {
    
    // Generate new ID
    for (let i = 0; i < length; i++) {
      tempArray[i] = characters.charAt(Math.floor(Math.random() * characters.length));
    }
    gameId = tempArray.join('');
    
    // Check uniqueness again
    isUnique = !getGamesFromLocalStorage().some(game => game.gameId === gameId);
  }

  return gameId;
};

export const isValidGame = (game) => {
  // Required fields
  if (!game.title || game.title.trim() === '' ||
      !game.description || game.description.trim() === '') {
    return false;
  }

  // Validate difficulty level
  if (game.difficulty_level && 
      !['easy', 'medium', 'hard'].includes(game.difficulty_level)) {
    return false;
  }

  // Validate tags array
  if (game.tags && !Array.isArray(game.tags)) {
    return false;
  }

  // Validate dayOnly boolean
  if (game.dayOnly !== undefined && typeof game.dayOnly !== 'boolean') {
    return false;
  }

  return true;
};

/**
 * Upload a game image
 * @param {string} gameId - The game ID
 * @param {string} image_data - Base64 encoded image data
 * @returns {Promise<string>} The image URL
 */
export const uploadGameImage = async (gameId, image_data) => {
  try {
    const response = await authFetch(`${API_URL}/server/api/games/game_images.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, image_data })
    });

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data;
  } catch (error) {
    console.error('Error uploading game image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete a game image
 * @param {string} gameId - The game ID
 * @returns {Promise<void>}
 */
export const deleteGameImage = async (gameId) => {
  try {
    const response = await authFetch(`${API_URL}/server/api/games/game_images.php?gameId=${gameId}`, {
      method: 'DELETE',
      headers: {
      }
    });

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting game image:', error);
    throw new Error('Failed to delete image');
  }
};

export const saveGame = async (gameData) => {
  if (!isValidGame(gameData)) {
    throw new Error('Invalid game data');
  }
  
  // Sort challenges by order property if challenges exist
  if (gameData.challenges && Array.isArray(gameData.challenges)) {
    gameData.challenges.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  if (!gameData.gameId) {
    gameData.gameId = await generateUniqueGameId();
  }

  try {
    // Handle image upload first if present
    if (gameData.image_data) {
      const image_url = await uploadGameImage(gameData.gameId, gameData.image_data);
      gameData.image_url = image_url;
    }
    delete gameData.image_data; // Remove base64 data before saving game

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
        is_public: gameData.isPublic,
        difficulty: gameData.difficulty_level || 'medium',
        tags: gameData.tags || [],
        day_only: gameData.dayOnly || false,
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
        throw new Error('Failed to sync game with server');
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
    throw new Error('Failed to save game'); 
  }
};

export const getGames = async () => {
  let games = getGamesFromLocalStorage() || [];
  
  try {
    const isConnected = (await checkServerConnectivity()).isConnected;
    if (isConnected) {
      const response = await authFetch(`${API_URL}/server/api/games/games.php?action=get_games`);
      if (response.ok) {
        const rawText = await response.text();
        
        // Try to parse the raw text as JSON
        let jsonData;
        try {
            jsonData = JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Failed to parse text:', rawText);
            return games;
        }

        
        const serverGames = jsonData.data || [];
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

/**
 * Handle quitting from playtest mode and returning to editor
 * @param {string} gameId - Current game ID
 * @param {Function} navigate - React Router navigate function
 * @returns {void}
 */
export const handlePlaytestQuit = (gameId, navigate) => {
    const playtestState = getPlaytestState();
    if (playtestState?.gameId === gameId) {
        clearPlaytestState();
        navigate(`/create/edit/${gameId}`);
        return true;
    }
    return false;
};
