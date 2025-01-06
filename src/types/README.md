# Type Definitions

This directory contains TypeScript type definitions for the Raven Run application.

## Game Types (`games.ts`)

### Core Interfaces

#### `BaseGame`
Base interface for all game types with common properties:
- `id`: Server-generated auto-increment ID
- `gameId`: Unique 12-char identifier
- `title`: Game title
- `description`: Game description
- `challenges`: Array of challenges
- `public`: Public visibility flag
- Plus optional metadata (avg_rating, duration, tags, etc.)

#### `DownloadedGame`
Extends `BaseGame` with local storage properties:
- `downloadedAt`: Local download timestamp
- `lastPlayedAt`: Last played timestamp
- `completed`: Local completion status

#### `EditableGame`
Extends `BaseGame` with editing-specific properties:
- `isDraft`: Whether the game is being edited
- `lastModified`: Last modification timestamp

### Type Guards
- `isDownloadedGame(game: Game)`: Check if a game is downloaded
- `isEditableGame(game: Game)`: Check if a game is being edited
- `canPlayGame(game: Game)`: Check if a game can be played (dayOnly restriction)

## Challenge Types (`challengeTypes.ts`)

### Base Interface

#### `BaseChallenge`
Common properties for all challenge types:
- `id`: Challenge identifier
- `type`: Challenge type
- `title`: Challenge title
- `completionFeedback`: Optional feedback after completion
- `repeatable`: Whether challenge can be repeated
- `order`: Display order in game

### Challenge Types
- `StoryChallenge`: Text-based narrative challenges
- `MultipleChoiceChallenge`: Multiple choice questions
- `TrueFalseChallenge`: True/false questions
- `TextInputChallenge`: Free text input challenges
- `TravelChallenge`: Location-based challenges

### Type Guards
- `isStoryChallenge`
- `isMultipleChoiceChallenge`
- `isTrueFalseChallenge`
- `isTextInputChallenge`
- `isTravelChallenge`

## Usage

Import types in TypeScript files:
```typescript
import { Game, DownloadedGame, EditableGame } from '../types/games';
import { Challenge } from '../types/challengeTypes';
```

Import types in JavaScript files (JSDoc):
```javascript
/**
 * @typedef {import('../types/games').Game} Game
 * @typedef {import('../types/challengeTypes').Challenge} Challenge
 */
```
