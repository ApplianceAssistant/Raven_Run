import { Challenge, hasTargetLocation, hasHints } from '../types/challengeTypes';
import { calculateDistance, getCurrentLocation } from '../utils/utils';
import { paths } from '../data/challenges';

// Define the ChallengeState interface
export interface ChallengeState {
  isLocationReached: boolean;
  answer: string | boolean;
  hint: string;
  isCorrect: boolean;
  feedback: string;
  isAnswerSelected: boolean;
  textVisible: boolean;
}

// Update the initializeChallengeState function to include textVisible
export function initializeChallengeState(): ChallengeState {
  return {
    isLocationReached: false,
    answer: '',
    hint: '',
    isCorrect: false,
    feedback: '',
    isAnswerSelected: false,
    textVisible: false,
  };
}

export function updateDistance(challenge: Challenge): { distance: number | null, displayValue: string, unit: string } {
  const userLocation = getCurrentLocation();
  if (userLocation && hasTargetLocation(challenge)) {
    const distanceInMeters = calculateDistance(userLocation, challenge.targetLocation!);
    const distanceInMiles = (distanceInMeters / 1609.344).toFixed(2);
    const newDistance = parseFloat(distanceInMiles);

    if (newDistance >= 0.1) {
      return { distance: newDistance, displayValue: distanceInMiles, unit: 'miles' };
    } else {
      const distanceInFeet = Math.round(newDistance * 5280);
      return { distance: newDistance, displayValue: distanceInFeet.toString(), unit: 'feet' };
    }
  }
  return { distance: null, displayValue: '', unit: '' };
}

export function shouldDisplayDistanceNotice(challenge: Challenge): boolean {
  if (!challenge) {
    console.log("No challenge provided, distance notice not needed");
    return false;
  }
  console.log("challenge:", challenge);

  if (challenge.type !== 'travel') {
    console.log("Not a travel challenge, distance notice not needed");
    return false;
  }

  const hasValidLocation = hasTargetLocation(challenge);
  console.log("Has valid target location:", hasValidLocation);

  let radius: number;
  if (typeof challenge.radius === 'string') {
    radius = parseFloat(challenge.radius);
  } else if (typeof challenge.radius === 'number') {
    radius = challenge.radius;
  } else {
    radius = NaN;
  }

  const hasValidRadius = !isNaN(radius) && radius > 0;
  console.log("Has valid radius:", hasValidRadius, "Radius value:", radius);

  const shouldDisplay = hasValidLocation && hasValidRadius;
  console.log("Should display distance notice:", shouldDisplay);

  return shouldDisplay;
}

// New function to check if the continue button should be displayed
export function shouldDisplayContinueButton(challenge: Challenge, state: ChallengeState): boolean {
  switch (challenge.type) {
    case 'story':
      return state.textVisible; // Story is complete when text has been displayed
    case 'trueFalse':
      return state.isAnswerSelected && (state.isCorrect || (hasTargetLocation(challenge) && state.isLocationReached));
    case 'multipleChoice':
    case 'textInput':
      return state.isCorrect;
    case 'travel':
    case 'areaSearch':
      return hasTargetLocation(challenge) && state.isLocationReached;
    default:
      return false; // For any other challenge types
  }
}

// Add a new function for the skip button
export function shouldDisplaySkipButton(challenge: Challenge, state: ChallengeState): boolean {
  return !shouldDisplayContinueButton(challenge, state);
}

// New function to handle submit action
export function handleSubmit(challenge: Challenge, state: ChallengeState): ChallengeState {
  const isCorrect = checkAnswer(challenge, state.answer);
  const feedbackText = isCorrect 
    ? challenge.feedbackTexts?.correct || 'Correct!'
    : getNextIncorrectFeedback(challenge);

  return {
    ...state,
    isCorrect,
    feedback: feedbackText,
  };
}

// New function to get the next hint
export function getNextHintState(challenge: Challenge, currentState: ChallengeState): ChallengeState {
  if (hasHints(challenge)) {
    const nextHint = getNextHint(challenge);
    return { ...currentState, hint: nextHint };
  }
  return currentState;
}

// Map to keep track of hint indices for each challenge
const hintIndexMap = new Map<string, number>();

export function getPath(pathId: number) {
  return paths.find(path => path.id === pathId);
}

export function getChallenges(pathId: number): Challenge[] {
  const path = getPath(pathId);
  return path ? path.challenges : [];
}

export function getPathName(pathId: number): string {
  const path = getPath(pathId);
  return path ? path.name : 'Unknown Path';
}

export function getNextHint(challenge: Challenge): string {
  if (hasHints(challenge)) {
    let hintIndex = hintIndexMap.get(challenge.id) ?? -1;
    hintIndex = (hintIndex + 1) % challenge.hints!.length;
    hintIndexMap.set(challenge.id, hintIndex);
    return challenge.hints![hintIndex];
  }
  return "No hints available.";
}

export function resetHintCycle(challengeId: string): void {
  hintIndexMap.delete(challengeId);
}

export function checkLocationReached(challenge: Challenge, userLocation: { latitude: number, longitude: number }): boolean {
  if (!hasTargetLocation(challenge) || !challenge.radius) {
    return false;
  }

  if (!userLocation || typeof userLocation.latitude !== 'number' || typeof userLocation.longitude !== 'number') {
    return false;
  }

  const distance = calculateDistance(userLocation, challenge.targetLocation!);
  return distance <= challenge.radius;
}

export function checkAnswer(challenge: Challenge, answer: any): boolean {
  switch (challenge.type) {
    case 'story':
      return true; // Stories are always considered "correct"
    case 'multipleChoice':
    case 'textInput':
    case 'trueFalse':
      return challenge.correctAnswer === answer;
    default:
      return false;
  }
}

const lastFeedbackIndexMap = new Map<string, number>();

export function getNextIncorrectFeedback(challenge: Challenge): string {
  if (challenge.feedbackTexts && challenge.feedbackTexts.incorrect && challenge.feedbackTexts.incorrect.length > 0) {
    const incorrectFeedbacks = challenge.feedbackTexts.incorrect;
    let lastIndex = lastFeedbackIndexMap.get(challenge.id) ?? -1;
    let nextIndex = (lastIndex + 1) % incorrectFeedbacks.length;
    lastFeedbackIndexMap.set(challenge.id, nextIndex);
    return incorrectFeedbacks[nextIndex];
  }
  return 'Incorrect. Try again.';
}

export function resetFeedbackCycle(challengeId: string): void {
  lastFeedbackIndexMap.delete(challengeId);
}

export function canDisplayChallenge(challenge: Challenge, hasBeenDisplayed: boolean): boolean {
  if (challenge.type === 'story') {
    return challenge.repeatable || !hasBeenDisplayed;
  }
  return true; // Non-story challenges can always be displayed
}

export function canDisplayHints(challenge: Challenge): boolean {
  return hasHints(challenge);
}

export function canDisplayDistance(challenge: Challenge): boolean {
  return hasTargetLocation(challenge);
}

export function updateChallengeState(challenge: Challenge, currentState: ChallengeState, updates: Partial<ChallengeState>): ChallengeState {
  const newState = { ...currentState, ...updates };
  
  if (updates.answer !== undefined) {
    newState.isAnswerSelected = true;
    newState.feedback = '';
  }

  return newState;
}

export function shouldDisplaySubmitButton(challenge: Challenge, state: ChallengeState): boolean {
  return state.isAnswerSelected && !state.isCorrect;
}

export default {
  getPath,
  getChallenges,
  getPathName,
  checkLocationReached,
  checkAnswer,
  getNextIncorrectFeedback,
  resetFeedbackCycle,
  canDisplayChallenge,
  canDisplayHints,
  canDisplayDistance,
  initializeChallengeState,
  updateChallengeState,
  shouldDisplaySubmitButton,
  shouldDisplayContinueButton,
  handleSubmit,
  getNextHintState,
  updateDistance,
  shouldDisplayDistanceNotice,
  shouldDisplaySkipButton,
};