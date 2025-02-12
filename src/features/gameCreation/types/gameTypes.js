/**
 * @typedef {Object} Game
 * @property {number} [id] - Server-generated auto-increment ID
 * @property {string} gameId - Unique 12-char identifier
 * @property {string} title - Game name
 * @property {string} description - Game description
 * @property {Challenge[]} challenges - Array of challenges
 * @property {boolean} public - Public visibility flag
 * @property {boolean} isSynced - Database sync status
 * @property {string} [image_url] - URL of the game cover image
 * @property {string} [image_data] - Base64 encoded image data
 * @property {string} [creatorName] - Name of the game creator
 * @property {string[]} [tags] - Array of tags
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id - Challenge ID
 * @property {string} type - Challenge type
 * @property {string} title - Challenge title
 */

export const GameTypes = {
    // This empty object is just for TypeScript compatibility
    // The actual types are defined in JSDoc above
};
