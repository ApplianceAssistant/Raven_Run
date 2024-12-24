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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE challenges (
    id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) REFERENCES games(id),
    type VARCHAR(50) NOT NULL,
    order_index INT NOT NULL,
    content JSON NOT NULL,
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

### Challenges
- `GET /api/games/:id/challenges` - List challenges
- `POST /api/games/:id/challenges` - Create challenge
- `PUT /api/games/:id/challenges/:challengeId` - Update challenge
- `DELETE /api/games/:id/challenges/:challengeId` - Delete challenge

### Progress
- `GET /api/progress/:gameId` - Get game progress
- `POST /api/progress/:gameId` - Update progress
- `DELETE /api/progress/:gameId` - Reset progress

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
      id: string,
      title: string,
      description: string,
      challenges: Challenge[],
      lastSync: timestamp
    }
  },
  "gameProgress": {
    [gameId: string]: {
      currentChallenge: number,
      answers: Answer[],
      lastSync: timestamp
    }
  }
}
```

### Sync Strategy

1. **Initial Load**
   - Check local storage for cached data
   - Compare last sync timestamp with server
   - Fetch updates if local data is stale
   - Merge local and server data

2. **Real-time Updates**
   - Save changes to local storage immediately
   - Queue server updates for background sync
   - Track sync status with timestamps
   - Handle offline scenarios gracefully

3. **Conflict Resolution**
   - Use server-side timestamps as source of truth
   - Preserve local changes when possible
   - Implement retry mechanism for failed syncs
   - Log sync conflicts for debugging

4. **Error Handling**
   - Detect network connectivity issues
   - Queue failed requests for retry
   - Provide user feedback on sync status
   - Maintain data integrity during sync

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
