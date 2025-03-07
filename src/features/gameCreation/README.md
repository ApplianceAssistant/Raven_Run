# Game Creation Feature

This directory contains all the components, hooks, services, and utilities related to game creation functionality.

## Directory Structure

- `components/` - React components for game creation UI
  - `GameCreator/` - Main container component for game creation
  - `GameForm/` - Form component for creating and editing games
  - `GameList/` - Grid display of existing games
  - `ChallengeCard/` - Navigation card for challenge management
  - `ChallengeManager/` - Interface for managing game challenges
- `hooks/` - Custom React hooks for game creation logic
- `services/` - API and data management services
- `context/` - React context for state management
- `utils/` - Utility functions and helpers

## Component Architecture

### GameCreator
The main container component that handles routing and state management:
- Routes:
  - `/create` - Shows game list and creation
  - `/create/edit/:gameId` - Game editing interface
  - `/create/edit/:gameId/challenges` - Challenge management

### GameForm
Handles game creation and editing:
- Fields:
  - Game Name (required)
  - Description (required)
  - Public/Private toggle
  - Game ID (display only)
- Challenge navigation card when in edit mode

### GameList
Displays existing games in a grid layout:
- Game cards with hover effects
- Delete button with confirmation modal
- Click to edit functionality

### ChallengeCard
Navigation component for challenge management:
- Shows challenge count
- Dragon icon
- Hover effects and tooltip
- Click to navigate to challenge management

### ChallengeManager
Interface for managing game challenges:
- Back navigation to game editing
- List of existing challenges
- Add new challenge functionality
- Empty state handling

## Challenge Management

### ChallengeCreator
Handles creation and editing of individual challenges:
- Progressive UI that shows only type selection initially
- Dynamic fields based on challenge type:
  - Story: title, description, repeatable
  - Travel: title, description, target location, radius
  - Multiple Choice: title, question, options, correct answer
  - True/False: title, question, correct answer
  - Text Input: title, question, correct answer
- Common features across types:
  - Optional hints system
  - Challenge feedback management
  - Automatic order assignment for new challenges

### Challenge Types
Each challenge type has specific requirements and fields:
1. Story Challenges
   - Title and story text
   - Optional repeatable flag
   - Feedback for completion

2. Travel Challenges
   - Target location with latitude/longitude
   - Completion radius
   - Location selection UI
   - Completion feedback

3. Quiz Challenges (Multiple Choice, True/False, Text Input)
   - Question field
   - Answer options (varies by type)
   - Correct answer validation
   - Feedback for correct/incorrect answers

### State Management
- Uses GameCreationContext for centralized state
- Maintains challenge order
- Handles type-specific field initialization
- Preserves state during editing

### UI/UX Considerations
- Back button consistently positioned at top-left
- Save/Cancel buttons appear when changes are made
- ScrollableContent wrapper for long forms
- Clear visual hierarchy with proper spacing
- Type-specific field validation

### Best Practices
1. Field Initialization
   - Initialize only necessary fields for selected type
   - Maintain common fields across type changes
   - Clear irrelevant fields when changing types

2. Data Validation
   - Required field checking
   - Type-specific validation rules
   - Proper error messaging

3. Navigation
   - Consistent back button behavior
   - Confirmation for unsaved changes
   - Clear feedback on save/cancel actions

## State Management

Using GameCreationContext for centralized state:
- Games list
- Selected game
- Loading states
- Error handling

## Styling

Using SCSS modules with CSS variables for theming:
- Card-based design
- Hover effects and animations
- Responsive layout
- Consistent spacing and typography

## Navigation Flow

1. User lands on `/create`
   - Views list of existing games
   - Can create new game
   - Can select game to edit

2. User navigates to `/create/edit/:gameId`
   - Views game details
   - Can edit game properties
   - Can access challenge management

3. User navigates to `/create/edit/:gameId/challenges`
   - Views list of challenges
   - Can add/edit challenges
   - Can return to game editing

## Best Practices

1. Form Validation
   - Required fields checking
   - Data type validation
   - Feedback on validation state

2. Error Handling
   - API error catching
   - User feedback
   - Fallback states

3. State Management
   - Context for shared state
   - Local state for component-specific data
   - Proper prop drilling avoidance

4. UI/UX
   - Consistent styling
   - Clear navigation
   - Helpful tooltips
   - Loading states
   - Empty states

## Future Enhancements

1. Challenge Management
   - Challenge creation form
   - Challenge types
   - Challenge ordering
   - Challenge preview

2. Game Preview
   - Live preview of game
   - Mobile preview
   - Share functionality

3. Advanced Features
   - Game templates
   - Bulk challenge import
   - Game analytics
   - Collaboration tools
