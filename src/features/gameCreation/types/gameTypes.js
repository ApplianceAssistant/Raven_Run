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
 * @property {string} [creator_name] - Name of the game creator
 * @property {string[]} [tags] - Array of tags
 * @property {Object} gameSettings - Game settings
 * @property {string} gameSettings.writingStyle - Writing style
 * @property {string} gameSettings.gameGenre - Game genre
 * @property {string} gameSettings.tone - Tone
 * @property {string} gameSettings.customWritingStyle - Custom writing style
 * @property {string} gameSettings.customGameGenre - Custom game genre
 * @property {string} gameSettings.customTone - Custom tone
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id - Challenge ID
 * @property {string} type - Challenge type
 * @property {string} title - Challenge title
 */

export const GameTypes = {
  TRAVEL: 'travel',
  RIDDLE: 'riddle',
  PHOTO: 'photo',
  TRIVIA: 'trivia'
};

export const GameDifficulties = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const GameSettings = {
  writingStyle: 'default',
  gameGenre: 'default', 
  tone: 'default',
  customWritingStyle: '',
  customGameGenre: '',
  customTone: ''
};

export const defaultGameData = {
  title: '',
  description: '',
  isPublic: false,
  gameId: '',
  challenges: [],
  difficulty_level: GameDifficulties.MEDIUM,
  tags: [],
  dayOnly: false,
  image_url: '',
  image_data: '',
  imageDeleted: false,
  gameSettings: { ...GameSettings }
};
