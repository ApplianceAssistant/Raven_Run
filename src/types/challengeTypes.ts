// Feedback texts interface
export interface FeedbackTexts {
  correct: string;
  incorrect: string[];
}

// Base challenge type
interface BaseChallenge {
  id: string;
  type: string;
  title: string;
  description: string;
  question?: string; // Make this optional
  feedbackTexts?: FeedbackTexts; // Make this optional
  repeatable: boolean; // Add this field to all challenges
}

// Story Challenge
interface StoryChallenge extends BaseChallenge {
  type: 'story';
  storyText: string;
  // No feedbackTexts for story challenges
}

// Multiple Choice Challenge
interface MultipleChoiceChallenge extends BaseChallenge {
  type: 'multipleChoice';
  options: string[];
  correctAnswer: string;
  feedbackTexts: FeedbackTexts;
}

// True/False Challenge
interface TrueFalseChallenge extends BaseChallenge {
  type: 'trueFalse';
  correctAnswer: boolean;
  feedbackTexts: FeedbackTexts;
}

// Text Input Challenge
interface TextInputChallenge extends BaseChallenge {
  type: 'textInput';
  correctAnswer: string;
  feedbackTexts: FeedbackTexts;
}

// Travel Challenge
interface TravelChallenge extends BaseChallenge {
  type: 'travel';
  targetLocation: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  question: string;
  locationHints: string[]; // Array of hints to help find the location
  completionFeedback: string; // Feedback shown when the location is reached
  repeatable: boolean;
}

// Area Search Challenge
interface AreaSearchChallenge extends BaseChallenge {
  type: 'areaSearch';
  searchArea: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  clues: string[];
  feedbackTexts: FeedbackTexts;
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
export function isTravelChallenge(challenge: Challenge): challenge is TravelChallenge {
  return challenge.type === 'travel';
}
// ... other type guards ...