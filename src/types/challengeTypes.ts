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

//interface for media content
interface MediaContent {
  type: 'image' | 'video' | 'audio';
  url: string;
  altText?: string; // For accessibility
}

// Base challenge type
interface BaseChallenge {
  id: string;
  type: string;
  title: string;
  description?: string;
  question?: string;
  mediaContent?: MediaContent; // New field for media content
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

// Union type for all challenge types
export type Challenge = 
  | StoryChallenge
  | MultipleChoiceChallenge
  | TrueFalseChallenge
  | TextInputChallenge
  | TravelChallenge

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

export function hasTargetLocation(challenge: Challenge): boolean {
  
  if (!challenge || typeof challenge !== 'object') {
    return false;
  }

  if (!challenge.targetLocation || typeof challenge.targetLocation !== 'object') {
    return false;
  }

  const { latitude, longitude } = challenge.targetLocation;

  // Check if both latitude and longitude are numbers and not NaN
  const isValidNumber = (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );

  // Check if both latitude and longitude are not zero
  const isNonZero = latitude !== 0 || longitude !== 0;

  return isValidNumber && isNonZero;
}

export function hasHints(challenge: Challenge): boolean {
  return !!challenge && Array.isArray(challenge.hints) && challenge.hints.length > 0;
}

export function hasMediaContent(challenge: Challenge): boolean {
  return !!challenge && !!challenge.mediaContent;
}

export function isImageContent(mediaContent: MediaContent): boolean {
  return mediaContent.type === 'image';
}

export function isVideoContent(mediaContent: MediaContent): boolean {
  return mediaContent.type === 'video';
}

export function isAudioContent(mediaContent: MediaContent): boolean {
  return mediaContent.type === 'audio';
}