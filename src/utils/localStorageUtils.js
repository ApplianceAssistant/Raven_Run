/**
 * @typedef {import('../types/games').Game} Game
 * @typedef {import('../types/challengeTypes').Challenge} Challenge
 */

import { encryptData, decryptData } from './encryption';

const CUSTOM_GAMES_KEY = 'Custom_Games';
const DOWNLOADED_GAMES_KEY = 'Downloaded_Games';
const DEBUG_STORAGE_KEY = 'Debug_Custom_Games';
const PLAYTEST_KEY = 'Playtest_State';

/**
 * @returns {Game[]}
 */
export const getGamesFromLocalStorage = () => {
  try {
    // Try encrypted storage
    const encryptedGames = localStorage.getItem(CUSTOM_GAMES_KEY);
    if (!encryptedGames) {
      console.warn("No games found in localStorage");
      return [];
    }

    const games = decryptData(encryptedGames);
    console.warn('decrypted games:', games)
    if (!games || !Array.isArray(games)) {
      console.warn('Invalid games data format or decryption failed');
      return [];
    }

    return games
      .filter(game => game && typeof game === 'object' && (game.gameId || game.game_id))
      .map(game => normalizeGame(game));
  } catch (error) {
    console.error('Error getting games from localStorage:', error);
    return [];
  }
};

/**
 * Get a downloaded game by ID
 * @param {string} gameId 
 * @returns {Game|null}
 */
export const getDownloadedGame = (gameId) => {
  try {
    const storedData = localStorage.getItem(DOWNLOADED_GAMES_KEY);
    if (!storedData) return null;

    let downloadedGames;
    // Try to parse as JSON first (for legacy unencrypted data)
    try {
      downloadedGames = JSON.parse(storedData);
    } catch {
      // If JSON parse fails, try decryption
      try {
        downloadedGames = decryptData(storedData);
      } catch (decryptError) {
        console.error('Error decrypting downloaded games:', decryptError);
        return null;
      }
    }

    if (!downloadedGames || typeof downloadedGames !== 'object') {
      console.warn('Invalid downloaded games data format');
      return null;
    }

    const game = downloadedGames[gameId];
    return game ? normalizeGame(game) : null;
  } catch (error) {
    console.error('Error getting downloaded game:', error);
    return null;
  }
};

/**
 * Save a game to downloaded games storage
 * @param {Game} game 
 */
export const saveDownloadedGame = (game) => {
  try {
    const storedData = localStorage.getItem(DOWNLOADED_GAMES_KEY);
    let downloadedGames = {};

    if (storedData) {
      // Try to parse as JSON first (for legacy unencrypted data)
      try {
        downloadedGames = JSON.parse(storedData);
      } catch {
        // If JSON parse fails, try decryption
        try {
          downloadedGames = decryptData(storedData) || {};
        } catch (decryptError) {
          console.error('Error decrypting existing games:', decryptError);
          // Continue with empty object if both methods fail
        }
      }
    }

    const gameId = game.gameId || game.game_id;
    if (!gameId) {
      console.error('Game ID is required');
      return false;
    }

    downloadedGames[gameId] = {
      ...game,
      lastPlayed: new Date().toISOString()
    };

    const encryptedData = encryptData(downloadedGames);
    if (!encryptedData) {
      console.error('Failed to encrypt game data');
      return false;
    }
    
    localStorage.setItem(DOWNLOADED_GAMES_KEY, encryptedData);
    return true;
  } catch (error) {
    console.error('Error saving downloaded game:', error);
    return false;
  }
};

/**
 * Update last played time for a downloaded game
 * @param {string} gameId 
 */
export const updateGameLastPlayed = (gameId) => {
  try {
    const encryptedGames = localStorage.getItem(DOWNLOADED_GAMES_KEY);
    if (!encryptedGames) return false;

    let downloadedGames;
    // Try to parse as JSON first (for legacy unencrypted data)
    try {
      downloadedGames = JSON.parse(encryptedGames);
    } catch {
      // If JSON parse fails, try decryption
      try {
        downloadedGames = decryptData(encryptedGames);
      } catch (decryptError) {
        console.error('Error decrypting downloaded games:', decryptError);
        return false;
      }
    }

    if (!downloadedGames || typeof downloadedGames !== 'object') {
      console.warn('Invalid downloaded games data format');
      return false;
    }

    if (downloadedGames[gameId]) {
      downloadedGames[gameId].lastPlayed = new Date().toISOString();
      try {
        const encryptedData = encryptData(downloadedGames);
        localStorage.setItem(DOWNLOADED_GAMES_KEY, encryptedData);
        return true;
      } catch (encryptError) {
        console.error('Error encrypting games data:', encryptError);
        // Fallback to unencrypted storage if encryption fails
        localStorage.setItem(DOWNLOADED_GAMES_KEY, JSON.stringify(downloadedGames));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error updating game last played:', error);
    return false;
  }
};

/**
 * Remove a game from downloaded games
 * @param {string} gameId 
 */
export const removeDownloadedGame = (gameId) => {
  try {
    const encryptedGames = localStorage.getItem(DOWNLOADED_GAMES_KEY);
    if (!encryptedGames) return false;

    let downloadedGames;
    // Try to parse as JSON first (for legacy unencrypted data)
    try {
      downloadedGames = JSON.parse(encryptedGames);
    } catch {
      // If JSON parse fails, try decryption
      try {
        downloadedGames = decryptData(encryptedGames);
      } catch (decryptError) {
        console.error('Error decrypting downloaded games:', decryptError);
        return false;
      }
    }

    if (!downloadedGames || typeof downloadedGames !== 'object') {
      console.warn('Invalid downloaded games data format');
      return false;
    }

    delete downloadedGames[gameId];
    try {
      const encryptedData = encryptData(downloadedGames);
      localStorage.setItem(DOWNLOADED_GAMES_KEY, encryptedData);
      return true;
    } catch (encryptError) {
      console.error('Error encrypting games data:', encryptError);
      // Fallback to unencrypted storage if encryption fails
      localStorage.setItem(DOWNLOADED_GAMES_KEY, JSON.stringify(downloadedGames));
      return true;
    }
  } catch (error) {
    console.error('Error removing downloaded game:', error);
    return false;
  }
};

/**
 * Get all downloaded games
 * @returns {Game[]}
 */
export const getAllDownloadedGames = () => {
  try {
    const storedData = localStorage.getItem(DOWNLOADED_GAMES_KEY);
    if (!storedData) return [];

    let downloadedGames;
    // Try to parse as JSON first (for legacy unencrypted data)
    try {
      downloadedGames = JSON.parse(storedData);
    } catch {
      // If JSON parse fails, try decryption
      try {
        downloadedGames = decryptData(storedData);
      } catch (decryptError) {
        console.error('Error decrypting downloaded games:', decryptError);
        return [];
      }
    }

    if (!downloadedGames || typeof downloadedGames !== 'object') {
      console.warn('Invalid downloaded games data format');
      return [];
    }

    return Object.values(downloadedGames).map(game => normalizeGame(game));
  } catch (error) {
    console.error('Error getting all downloaded games:', error);
    return [];
  }
};

/**
 * Normalizes a challenge object to ensure consistent structure
 * @param {Object} challenge - Challenge object from either server or local storage
 * @returns {Challenge} - Normalized challenge object
 */
export const normalizeChallenge = (challenge) => {
  if (!challenge) return null;

  // Only normalize targetLocation if it exists
  const targetLocation = challenge.targetLocation ? {
    latitude: typeof challenge.targetLocation.latitude === 'string' ? 
              parseFloat(challenge.targetLocation.latitude) : 
              (typeof challenge.targetLocation.latitude === 'number' ? challenge.targetLocation.latitude : null),
    longitude: typeof challenge.targetLocation.longitude === 'string' ? 
              parseFloat(challenge.targetLocation.longitude) : 
              (typeof challenge.targetLocation.longitude === 'number' ? challenge.targetLocation.longitude : null)
  } : null;

  // Only include targetLocation in the result if both coordinates are valid numbers
  const hasValidLocation = targetLocation && 
                         typeof targetLocation.latitude === 'number' && 
                         typeof targetLocation.longitude === 'number' && 
                         !isNaN(targetLocation.latitude) && 
                         !isNaN(targetLocation.longitude);

  return {
    ...challenge,
    targetLocation: hasValidLocation ? targetLocation : null,
    radius: typeof challenge.radius === 'string' ? parseFloat(challenge.radius) : (challenge.radius || 10),
    order: typeof challenge.order === 'string' ? parseInt(challenge.order) : (challenge.order || 0)
  };
};

/**
 * Normalizes a game object to ensure consistent structure
 * @param {Object} game - Game object from either server or local storage
 * @returns {Game} - Normalized game object
 */
export const normalizeGame = (game) => {
  if (!game) return null;

  let challenges = [];
  if (game.challenge_data) {
    try {
      const parsedData = JSON.parse(game.challenge_data);
      // If challenge_data contains the entire game object, extract just the challenges
      challenges = Array.isArray(parsedData) ? parsedData :
                  Array.isArray(parsedData.challenges) ? parsedData.challenges :
                  [];
    } catch (e) {
      console.error('Error parsing challenge_data:', e);
    }
  } else if (Array.isArray(game.challenges)) {
    challenges = game.challenges;
  }

  // Normalize each challenge
  challenges = challenges.map(challenge => normalizeChallenge(challenge));

  return {
    ...game,  // Keep all original properties
    gameId: game.gameId || game.game_id || game.id || '',
    title: game.title || '',
    description: game.description || '',
    isPublic: game.isPublic ?? game.is_public ?? false,
    difficulty: game.difficulty || game.difficulty_level || 'medium',
    difficulty_level: game.difficulty || game.difficulty_level || 'medium',
    distance: typeof game.distance === 'number' ? game.distance : 
             typeof game.distance === 'string' ? parseFloat(game.distance) : 0,
    estimatedTime: parseInt(game.estimatedTime || game.estimated_time) || 60,
    creator_name: game.creator_name || game.creatorName || 'Anonymous',
    dayOnly: Boolean(game.dayOnly || game.day_only),
    avg_rating: typeof game.avg_rating === 'number' ? game.avg_rating :
               typeof game.avg_rating === 'string' ? parseFloat(game.avg_rating) : 0,
    rating_count: typeof game.rating_count === 'number' ? game.rating_count :
                 typeof game.rating_count === 'string' ? parseInt(game.rating_count) : 0,
    startLocation: game.startLocation || {
      latitude: parseFloat(game.start_latitude || game.startLat || 0),
      longitude: parseFloat(game.start_longitude || game.startLong || 0)
    },
    isSynced: game.isSynced ?? true,
    challenges: challenges,
    lastModified: game.lastModified || game.last_modified || game.updated_at || Date.now(),
    lastAccessed: Date.now(),
    image_url: game.image_url || '',
    image_data: game.image_data || '',
    creatorName: game.creatorName || game.creator_name || 'Anonymous',
    tags: game.tags || [],

  };
};

/**
 * @param {Game|Game[]} gameData
 */
export const saveGameToLocalStorage = async (gameData) => {
  try {
    const games = getGamesFromLocalStorage();
    const gamesArray = Array.isArray(gameData) ? gameData : [gameData];
    
    // Normalize and merge games
    for (const game of gamesArray) {
      const normalizedGame = normalizeGame(game);
      if (!normalizedGame) continue;

      const index = games.findIndex(g => g.gameId === normalizedGame.gameId);
      if (index !== -1) {
        games[index] = normalizedGame;
      } else {
        games.push(normalizedGame);
      }

      // Also update in Downloaded_Games
      try {
        const storedData = localStorage.getItem(DOWNLOADED_GAMES_KEY);
        let downloadedGames = {};
        if (storedData) {
          try {
            downloadedGames = JSON.parse(storedData);
          } catch {
            try {
              downloadedGames = decryptData(storedData) || {};
            } catch (decryptError) {
              console.error('Error decrypting existing games:', decryptError);
            }
          }
        }
        downloadedGames[normalizedGame.gameId] = normalizedGame;
        const encryptedDownloadedGames = await encryptData(downloadedGames);
        if (encryptedDownloadedGames) {
          localStorage.setItem(DOWNLOADED_GAMES_KEY, encryptedDownloadedGames);
        }
      } catch (error) {
        console.error('Error updating Downloaded_Games:', error);
      }
    }

    // Remove old games if we exceed storage limit
    const MAX_STORED_GAMES = 20;
    if (games.length > MAX_STORED_GAMES) {
      games.sort((a, b) => b.lastAccessed - a.lastAccessed);
      games.length = MAX_STORED_GAMES;
    }

    // Save to debug storage first (unencrypted)
    //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(games));

    // Then save encrypted version
    const encryptedGames = await encryptData(games);
    if (encryptedGames) {
      localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);
    }
  } catch (error) {
    console.error('Error saving games to localStorage:', error);
  }
};

/**
 * @param {number} gameId
 * @param {Challenge} updatedChallenge
 */
export const updateChallengeInLocalStorage = (gameId, updatedChallenge) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.map(game => {
    if (game.gameId === gameId) {
      const updatedChallenges = game.challenges.map(challenge => 
        challenge.id === updatedChallenge.id ? updatedChallenge : challenge
      );
      return { ...game, challenges: updatedChallenges };
    }
    return game;
  });
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);

  // Update debug storage
  //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

/**
 * @param {number} gameId
 */
export const deleteGameFromLocalStorage = (gameId) => {
  const games = getGamesFromLocalStorage();
  const updatedGames = games.filter(game => game.gameId !== gameId);
  const encryptedGames = encryptData(updatedGames);
  localStorage.setItem(CUSTOM_GAMES_KEY, encryptedGames);

  // Update debug storage
  //localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(updatedGames));
};

export const clearGamesFromLocalStorage = () => {
  try {
    localStorage.removeItem(CUSTOM_GAMES_KEY);
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing games from localStorage:', error);
  }
};

/**
 * Set playtest state
 * @param {string} gameId - ID of game being playtested
 */
export const setPlaytestState = (gameId) => {
  try {
    localStorage.setItem(PLAYTEST_KEY, JSON.stringify({ gameId }));
  } catch (error) {
    console.error('Error setting playtest state:', error);
  }
};

/**
 * Get playtest state
 * @returns {{ gameId: string } | null}
 */
export const getPlaytestState = () => {
  try {
    const state = localStorage.getItem(PLAYTEST_KEY);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error getting playtest state:', error);
    return null;
  }
};

/**
 * Clear playtest state
 */
export const clearPlaytestState = () => {
  try {
    localStorage.removeItem(PLAYTEST_KEY);
  } catch (error) {
    console.error('Error clearing playtest state:', error);
  }
};