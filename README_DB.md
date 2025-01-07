# API and Database Architecture

## Directory Structure

```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components and logic
├── css/              # Styling files
├── utils/            # Utility functions
├── config/           # Configuration files
└── types/            # TypeScript type definitions

server/
├── api/              # API endpoints
│   ├── auth/         # Authentication endpoints
│   ├── games/        # Game management endpoints
│   └── users/        # User management endpoints
├── database/         # Database configuration and migrations
├── models/           # Database models and schemas
└── utils/           # Server utilities

database/
├── migrations/       # Database migration files
└── seeds/           # Seed data for development
```

## Database Schema

For the complete and most up-to-date database structure, please refer to `schema.sql` in the root directory. This file contains the full SQL schema including all tables, constraints, and indexes.

Key tables include:

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id VARCHAR(36) PRIMARY KEY,
    creator_id VARCHAR(36) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    challenge_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Progress table
CREATE TABLE game_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    game_id VARCHAR(36) REFERENCES games(id),
    current_challenge INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, game_id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify authentication

### Games
- `GET /api/games` - List games
- `POST /api/games` - Create game
- `GET /api/games/:id` - Get game details
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Progress
- `GET /api/progress/:gameId` - Get game progress
- `POST /api/progress/:gameId` - Update progress
- `DELETE /api/progress/:gameId` - Reset progress

## API Development Guidelines

### Server Communication Requirements
1. All PHP API endpoints must:
   - Include db_connection.php at the top (handles CORS and database)
   - Include errorHandler.php for consistent error logging
   - Set Content-Type header before any output
   - Follow consistent error handling patterns
   ```php
   <?php
   require_once __DIR__ . '/../../utils/db_connection.php';
   require_once __DIR__ . '/../../utils/errorHandler.php';
   
   // Set content type before any output
   header('Content-Type: application/json');
   
   // Get database connection
   $conn = getDbConnection();
   if (!$conn) {
       handleError(500, 'Failed to connect to database', __FILE__, __LINE__);
       exit(0);
   }
   ```

2. Error Handling:
   - Always use handleError() for consistent error logging
   - Include file and line information for debugging
   - Format: handleError(status_code, error_message, __FILE__, __LINE__)
   - Exit after handling critical errors

## Data Synchronization

### Local Storage Structure
```javascript
{
  "user": {
    "id": string,
    "username": string,
    "email": string,
    "token": string
  },
  "games": {
    [gameId: string]: {
      gameId: string,
      title: string,
      description: string,
      isPublic: boolean,
      isSynced: boolean,
      challenges: Challenge[],
      lastModified: timestamp,
      lastAccessed: timestamp
    }
  }
}
```

### Sync Strategy

1. **Initial Load**
   - Check local storage for cached game data
   - Compare last sync timestamp with server
   - Fetch updates if local data is stale
   - Parse and normalize challenge data from server
   - Store normalized data in local storage

2. **Challenge Data Handling**
   - Challenge data is stored as JSON in the database
   - Server provides challenge array in normalized format
   - Client normalizes data through utility functions
   - Handles TypeScript/JavaScript syntax differences

3. **Real-time Updates**
   - Save changes to local storage immediately
   - Queue server updates for background sync
   - Track sync status with timestamps
   - Handle offline scenarios gracefully

4. **Conflict Resolution**
   - Use server-side timestamps as source of truth
   - Preserve local changes when possible
   - Implement retry mechanism for failed syncs
   - Log sync conflicts for debugging

5. **Error Recovery**
   - Failed server syncs preserve local changes
   - Automatic retry mechanism for offline updates
   - Conflict resolution based on lastModified timestamp
   - Detailed error logging for debugging

6. **Data Integrity**
   - Validation checks before save operations
   - Preservation of existing data during updates
   - Proper merging of local and server data
   - Prevention of malformed object creation

### Security Measures

1. **Authentication**
   - JWT-based authentication
   - Token refresh mechanism
   - Secure token storage
   - CSRF protection

2. **Data Protection**
   - Input validation
   - Data sanitization
   - Permission checks
   - Rate limiting

3. **API Security**
   - HTTPS enforcement
   - API key validation
   - Request throttling
   - Error logging
