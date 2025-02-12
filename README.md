# Raven Run - Interactive Scavenger Hunt Application

## Project Overview
Raven Run is a web-based scavenger hunt application that allows users to create and participate in location-based challenges and games. The application supports various challenge types including travel/location-based challenges, multiple choice questions, true/false questions, and story-based challenges.

## Development Conversation Guidelines

### Communication and Code Changes
1. Before making any code changes:
   - Outline the planned changes
   - Wait for approval before proceeding
   - Break down complex changes into smaller, manageable steps

2. When proposing changes:
   - Explain which files will be modified/created
   - Describe the purpose of each change
   - Only show code drafts when specifically requested

3. After approval:
   - Proceed with implementing the agreed-upon changes
   - DO NOT make changes that are unrelated to the proposed changes
   - Follow the existing patterns and conventions
   - Maintain consistent error handling and logging

### File Modifications
1. **Pre-modification Approval**
   - Always explain planned changes before modifying any files
   - Get explicit approval before proceeding with modifications
   - Provide clear reasoning for proposed changes

2. **Clarification Requirements**
   - Ask all necessary questions before starting modifications
   - Seek clarification on ambiguous requirements
   - Confirm understanding before implementing changes

3. **New File Creation**
   - Always request permission before creating new files
   - Explain the purpose and necessity of new files
   - Provide proposed file structure and content overview

### Styling Guidelines
1. **CSS Usage**
   - Prioritize using existing styles and classes
   - Reference current styling patterns in `src/css/`
   - Always review _variables.scss first and do not create new style veriables
   - Request approval before creating new styles/classes
   - Provide justification for new style additions

### Code Review Process
1. **Before Implementation**
   - Review existing codebase for similar functionality
   - Identify potential impacts on other components
   - Discuss approach and alternatives

2. **During Implementation**
   - Follow established patterns and conventions
   - Document significant decisions
   - Maintain consistent code style

3. **After Implementation**
   - Explain changes made
   - Highlight any deviations from original plan
   - Document any new patterns introduced

### Communication Best Practices
1. **Clear Intent**
   - Explain reasoning behind proposed changes
   - Outline expected impacts
   - Describe alternatives considered

2. **Progressive Disclosure**
   - Break down complex changes into manageable steps
   - Seek confirmation at key decision points

3. **Documentation**
   - Update relevant documentation alongside changes
   - Note any new patterns or conventions
   - Document any workarounds or temporary solutions


## Project Structure

### Key Directories
```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components and logic
│   └── gameCreation/  # Game creation and management
│       ├── components/# Game creation components
│       ├── context/   # Game creation state management
│       └── services/  # Game-related services
├── css/              # Styling files
├── utils/            # Utility functions
├── config/           # Configuration files
└── types/            # TypeScript type definitions
```

### Server Structure
```
server/
├── api/              # API endpoints grouped by feature
│   ├── auth/         # Authentication endpoints
│   ├── games/        # Game-related endpoints
│   └── users/        # User management endpoints
├── config/           # Server configuration
│   └── cors.php      # CORS configuration
├── utils/            # Shared utility functions
│   ├── db_connection.php    # Database connection handling
│   ├── encryption.php       # Encryption utilities
│   └── errorHandler.php     # Error handling utilities
└── logs/             # Server logs directory
```

### Key Files

#### Type Definitions
- `src/types/games.ts`
  - Centralized game type definitions
  - Includes BaseGame, DownloadedGame, and EditableGame interfaces
  - Type guards for game state checking

- `src/types/challengeTypes.ts`
  - Challenge type definitions
  - Supports multiple challenge types (Story, MultipleChoice, TrueFalse, etc.)
  - Common challenge properties like completionFeedback

#### Game Creation
- `src/features/gameCreation/components/GameCreator/GameCreator.js`
  - Main component for game creation and management
  - Handles game CRUD operations
  - Manages game state and properties

- `src/features/gameCreation/components/ChallengeCreator/ChallengeCreator.js`
  - Challenge creation and editing component
  - Supports multiple challenge types
  - Handles location-based challenge configuration

#### Core Components
- `src/components/Challenge.js`: Challenge rendering and interaction
- `src/components/CreateProfile.js`: User profile creation
- `src/components/LogIn.js`: Authentication handling

#### State Management
- `src/features/gameCreation/context/GameCreationContext.js`
  - Manages game creation state
  - Provides game-related actions and data

#### Utilities
- `src/utils/localStorageUtils.js`: Local storage management
- `src/utils/unitConversion.js`: Distance unit conversion utilities
- `src/utils/challengeAnalysis.js`: Challenge validation and analysis

#### Important File Dependencies
- `server/utils/db_connection.php`: Central database connection handler
  - Requires `.env` file in project root for database credentials
  - Loads CORS configuration from `server/config/cors.php`
  - Creates and manages logs in `server/logs/` directory

- `server/config/cors.php`: CORS configuration
  - Depends on `db_connection.php` for environment variables
  - Configures allowed origins based on environment

- API endpoints in `server/api/`
  - All endpoints require `db_connection.php` for database access
  - Use `errorHandler.php` for consistent error handling
  - Follow CORS configuration from `cors.php`

### Environment Setup
The application requires a `.env` file in the project root directory. Use `.env.template` as a starting point:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
APP_ENV=development
```

### API Response Handling

The application implements a robust API response handling system that works consistently across different environments:

1. **Server-Side Response Format**:
   ```php
   // All API responses follow this structure
   {
       "status": "success|error",
       "data": payload,      // for success responses
       "message": "success message|error message"    // for user displayable message
   }
   ```

2. **Client-Side Handling**:
   ```javascript
   // Recommended pattern for API calls
   const response = await fetch(url);
   const rawText = await response.text();
   const jsonData = JSON.parse(rawText);
   
   if (jsonData.status === 'success') {
       return jsonData.data;
   }
   ```

3. **Environment Considerations**:
   - Development and production environments may handle responses differently
   - Always use explicit encoding settings in PHP responses
   - Handle UTF-8 encoding consistently across environments
   - Use proper content-type headers and JSON encoding flags

4. **Error Handling**:
   - Consistent error format across all API endpoints
   - Detailed error messages in development
   - Sanitized error messages in production
   - Proper logging of all API errors

## Challenge Types

### Travel Challenges
- Location-based challenges requiring physical presence
- Configurable radius for completion
- Uses device geolocation
- Fields:
  - Target Location (latitude/longitude)
  - Radius
  - Completion Feedback

### Story Challenges
- Narrative-based challenges
- Support for rich text descriptions
- Fields:
  - Description
  - Feedback Texts

### Multiple Choice
- Multiple choice questions
- Configurable options and correct answer
- Fields:
  - Question
  - Options
  - Correct Answer
  - Feedback

### True/False
- Boolean choice questions
- Simple true/false responses
- Fields:
  - Question
  - Correct Answer
  - Feedback

## Data Validation and Integrity

### Game Objects
- Required fields: gameId, name, description
- Name and description must be non-empty strings
- Challenge data stored as JSON in database
- Challenge array normalized during sync
- All updates preserve existing challenge data
- Handles TypeScript/JavaScript syntax differences

### Synchronization States
- isSynced flag indicates server sync status
- lastModified timestamp for conflict resolution
- lastAccessed timestamp for local storage management
- Offline-first approach with local storage fallback
- Challenge data normalized during sync operations

## Key Features

### Game Creation
1. Create new games with:
   - Title
   - Description
   - Public/Private visibility
   - Multiple challenges

2. Challenge Management:
   - Add/Edit/Delete challenges
   - Reorder challenges
   - Configure challenge-specific settings

### Game Playing
1. Progressive challenge completion
2. Location verification for travel challenges
3. Feedback system for correct/incorrect answers
4. Progress tracking and saving

## Common Workflows

### Creating a New Game
1. Navigate to game creation
2. Set game details (title, description, visibility)
3. Add challenges:
   - Select challenge type
   - Configure challenge settings
   - Add feedback and hints
4. Save and publish game

### Editing Existing Games
1. Select game from list
2. Modify game properties
3. Edit existing challenges or add new ones
4. Save changes

### Managing Challenges
1. Access challenge creator
2. Configure challenge-specific fields
3. Set completion criteria
4. Add feedback messages
5. Save challenge to game

## Development Notes

### State Management
- Uses React Context for game creation state
- Local storage for game data persistence
- Maintains challenge order and relationships

### Location Handling
- Uses browser geolocation API
- Supports both metric and imperial units
- Handles location permission requests

### UI/UX Considerations
- Responsive design for mobile use
- Clear feedback for user actions
- Progressive disclosure of features

## Image Upload System

1. **Game Cover Images**
   - Images are stored in `/server/permanent_uploads/games/{gameId}/`
   - Supports version control with previous versions in `.previous` subdirectory
   - Maintains the last 2 previous versions for rollback capability
   - File naming convention: 
     - Current: `cover.jpg`
     - Previous: `{timestamp}_cover.jpg`

2. **Image Processing**
   - Maximum file size: 5MB
   - Images are automatically cropped and centered
   - Served via `/server/permanent_uploads/games/{gameId}/cover.jpg`
   - Previous versions accessible in `.previous` directory

3. **Components and Services**
   - `game_images.php`: Backend endpoint for image operations
   - `gameCreatorService.js`: Frontend service for image upload/delete
   - `ImageUploadModal`: Reusable component for image upload/crop
   - Integrated with both GameForm and Profile components

4. **Error Handling**
   - Size validation (5MB limit)
   - File type validation (images only)
   - Ownership validation before modifications
   - Comprehensive error logging in PHP error logs

5. **UI/UX Features**
   - Hover overlay for image actions
   - Edit and remove capabilities
   - Loading states during upload
   - Success/error notifications
   - Maintains consistent 200x200 display size

### API Response Format
Game image endpoints follow the standard response format:
```json
{
  "status": "success|error",
  "imageUrl": "/server/permanent_uploads/games/{gameId}/cover.jpg",
  "message": "Success/error message"
}
```

## Common Issues and Solutions

1. Location Updates
   - Ensure proper permission handling
   - Check for valid coordinates
   - Verify radius calculations

2. Challenge State
   - Preserve existing challenge data during edits
   - Maintain challenge order
   - Handle type-specific fields correctly

3. Game Saving
   - Validate required fields
   - Preserve existing challenges
   - Handle unsaved changes

## Future Enhancements
- [ ] Advanced challenge types
- [ ] Multiplayer support
- [ ] Enhanced location features
- [ ] Social sharing capabilities
- [ ] Achievement system
