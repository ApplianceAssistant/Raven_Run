// Feedback texts interface
export interface FeedbackTexts {
  correct: string;
  incorrect: string[];
}

// Location interface
export interface Location {
  latitude: number;
  longitude: number;
}

// Base challenge type
interface BaseChallenge {
  id: string;
  type: string;
  title: string;
  description?: string;
  question?: string;
  hints?: string[];
  feedbackTexts?: FeedbackTexts;
  repeatable: boolean;
  targetLocation?: Location;
  radius?: number; // in meters, used if targetLocation is set
}

// Story Challenge
interface StoryChallenge extends BaseChallenge {
  type: 'story';
  storyText: string;
}

// Multiple Choice Challenge
interface MultipleChoiceChallenge extends BaseChallenge {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: string;
}

// True/False Challenge
interface TrueFalseChallenge extends BaseChallenge {
  type: 'trueFalse';
  correctAnswer: boolean;
}

// Text Input Challenge
interface TextInputChallenge extends BaseChallenge {
  type: 'textInput';
  correctAnswer: string;
}

// Travel Challenge
interface TravelChallenge extends BaseChallenge {
  type: 'travel';
  completionFeedback: string; // Feedback shown when the location is reached
}

// Area Search Challenge
interface AreaSearchChallenge extends BaseChallenge {
  type: 'areaSearch';
  clues: string[];
}

// Union type for all challenge types
export type Challenge = 
  | StoryChallenge
  | MultipleChoiceChallenge
  | TrueFalseChallenge
  | TextInputChallenge
  | TravelChallenge
  | AreaSearchChallenge;

// Type guard functions
export function isStoryChallenge(challenge: Challenge): challenge is StoryChallenge {
  return challenge.type === 'story';
}

export function isMultipleChoiceChallenge(challenge: Challenge): challenge is MultipleChoiceChallenge {
  return challenge.type === 'multipleChoice';
}

export function isTrueFalseChallenge(challenge: Challenge): challenge is TrueFalseChallenge {
  return challenge.type === 'trueFalse';
}

export function isTextInputChallenge(challenge: Challenge): challenge is TextInputChallenge {
  return challenge.type === 'textInput';
}

export function isTravelChallenge(challenge: Challenge): challenge is TravelChallenge {
  return challenge.type === 'travel';
}

export function isAreaSearchChallenge(challenge: Challenge): challenge is AreaSearchChallenge {
  return challenge.type === 'areaSearch';
}

export function hasTargetLocation(challenge: Challenge): boolean {
  return !!challenge && !!challenge.targetLocation;
}

export function hasHints(challenge: Challenge): boolean {
  return !!challenge && Array.isArray(challenge.hints) && challenge.hints.length > 0;
}