import { Challenge } from './challengeTypes';

/**
 * Base interface for a game
 */
export interface BaseGame {
    /** Server-generated auto-increment ID */
    id?: number;
    /** Unique 12-char identifier */
    gameId: string;
    /** User ID of the game creator */
    user_id?: number;
    /** Game title */
    title: string;
    /** Legacy game name field for backward compatibility */
    name?: string;
    /** Game description */
    description: string;
    /** Game cover image URL */
    image_url?: string;
    /** Original image data for upload/edit */
    image_data?: string;
    /** Array of challenges in the game */
    challenges: Challenge[];
    /** Whether the game is publicly visible */
    isPublic: boolean;
    /** Whether the game is synced with the server */
    isSynced: boolean;
    /** Whether the game can only be played during daytime */
    dayOnly?: boolean;
    /** Average rating of the game */
    avg_rating?: number;
    /** Number of ratings received */
    ratingCount?: number;
    /** Estimated duration in minutes */
    duration?: number;
    /** Array of game tags */
    tags?: string[];
    /** Name of the game creator */
    creator_name?: string;
}

/**
 * Game type with optional metadata for downloaded games
 */
export interface DownloadedGame extends BaseGame {
    /** Local download timestamp */
    downloadedAt?: number;
    /** Local last played timestamp */
    lastPlayedAt?: number;
    /** Local completion status */
    completed?: boolean;
}

/**
 * Game type with required fields for creating/editing games
 */
export interface EditableGame extends BaseGame {
    /** Whether the game is currently being edited */
    isDraft?: boolean;
    /** Last modification timestamp */
    lastModified?: number;
}

/**
 * Union type for all game variations
 */
export type Game = BaseGame | DownloadedGame | EditableGame;

/**
 * Type guard to check if a game is downloaded
 */
export function isDownloadedGame(game: Game): game is DownloadedGame {
    return 'downloadedAt' in game;
}

/**
 * Type guard to check if a game is being edited
 */
export function isEditableGame(game: Game): game is EditableGame {
    return 'isDraft' in game;
}

/**
 * Type guard to check if a game can be played during current time
 */
export function canPlayGame(game: Game): boolean {
    if (!game.dayOnly) return true;
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18; // Between 6 AM and 6 PM
}
