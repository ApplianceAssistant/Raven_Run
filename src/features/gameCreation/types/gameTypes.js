/**
 * @typedef {Object} Game
 * @property {number} [id] - Server-generated auto-increment ID
 * @property {string} game_id - Unique 12-char identifier
 * @property {string} name - Game name
 * @property {string} description - Game description
 * @property {Challenge[]} challenges - Array of challenges
 * @property {boolean} public - Public visibility flag
 * @property {boolean} isSynced - Database sync status
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
