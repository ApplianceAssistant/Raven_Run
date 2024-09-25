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
  currentHint: number;
  startTime: number;
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
    currentHint: 0,
    startTime: Date.now(),
  };
}

export function updateDistance(challenge: Challenge): { 
  distance: number | null, 
  displayValue: string, 
  unit: string,
  direction: string 
} {
  const userLocation = getCurrentLocation();
  if (userLocation && hasTargetLocation(challenge)) {
    const distanceInMeters = calculateDistance(userLocation, challenge.targetLocation!);
    const distanceInMiles = (distanceInMeters / 1609.344).toFixed(2);
    const newDistance = parseFloat(distanceInMiles);

    let displayValue, unit;
    if (newDistance >= 0.1) {
      displayValue = distanceInMiles;
      unit = 'miles';
    } else {
      displayValue = Math.round(newDistance * 5280).toString();
      unit = 'feet';
    }

    const direction = calculateDirection(userLocation, challenge.targetLocation!);

    return { distance: newDistance, displayValue, unit, direction };
  }
  return { distance: null, displayValue: '', unit: '', direction: '' };
}

function calculateDirection(from: { latitude: number, longitude: number }, to: { latitude: number, longitude: number }): string {
  const dLon = to.longitude - from.longitude;
  const y = Math.sin(dLon) * Math.cos(to.latitude);
  const x = Math.cos(from.latitude) * Math.sin(to.latitude) - Math.sin(from.latitude) * Math.cos(to.latitude) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(bearing / 45) % 8];
}

export function shouldDisplayDistanceNotice(challenge: Challenge): boolean {
  if (!challenge) {
    return false;
  }

  if (challenge.type !== 'travel') {
    return false;
  }

  const hasValidLocation = hasTargetLocation(challenge);

  let radius: number;
  if (typeof challenge.radius === 'string') {
    radius = parseFloat(challenge.radius);
  } else if (typeof challenge.radius === 'number') {
    radius = challenge.radius;
  } else {
    radius = NaN;
  }

  const hasValidRadius = !isNaN(radius) && radius > 0;
  const shouldDisplay = hasValidLocation && hasValidRadius;

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
      return hasTargetLocation(challenge) && state.isLocationReached;
    default:
      return false; // For any other challenge types
  }
}

export function shouldDisplaySkipButton(challenge: Challenge, state: ChallengeState): boolean {
  if (shouldDisplayContinueButton(challenge, state)) {
    return false;
  }

  const currentTime = new Date().getTime();
  const startTime = state.startTime || currentTime;
  const timeElapsed = currentTime - startTime;
  const fiveMinutesInMs = 5 * 60 * 1000;

  return timeElapsed >= fiveMinutesInMs;
}

export function getTimeUntilSkip(state: ChallengeState): number {
  const currentTime = Date.now();
  const timeElapsed = currentTime - state.startTime;
  const fiveMinutesInMs = 5 * 60 * 1000;
  const timeRemaining = Math.max(fiveMinutesInMs - timeElapsed, 0);
  return Math.ceil(timeRemaining / 1000); // Return remaining time in seconds
}
// New function to get the next hint
export const getNextHintState = (challenge, prevState) => {
  const nextHintIndex = ((prevState.currentHint ?? -1) + 1) % challenge.hints.length;
  return {
    ...prevState,
    currentHint: nextHintIndex,
    hint: challenge.hints[nextHintIndex]
  };
};

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

export function handleSubmit(challenge: Challenge, state: ChallengeState): ChallengeState {
  const isCorrect = checkAnswer(challenge, state.answer);
  console.log("handleSubmit - isCorrect:", isCorrect, "answer:", state.answer, "correctAnswer:", challenge.correctAnswer);
  const feedbackText = isCorrect 
    ? challenge.feedbackTexts?.correct || 'Correct!'
    : getNextIncorrectFeedback(challenge);
  return {
    ...state,
    isCorrect,
    feedback: feedbackText,
  };
}

export function checkAnswer(challenge: Challenge, answer: any): boolean {
  console.log("checkAnswer - challenge type:", challenge.type, "answer:", answer, "correctAnswer:", challenge.correctAnswer);
  switch (challenge.type) {
    case 'story':
      return true; // Stories are always considered "correct"
    case 'multipleChoice':
      return normalizeString(challenge.correctAnswer) === normalizeString(answer);
    case 'textInput':
      return checkTextInputAnswer(challenge.correctAnswer, answer);
    case 'trueFalse':
      return challenge.correctAnswer === answer;
    default:
      return false;
  }
}

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

function checkTextInputAnswer(correctAnswer: string, userAnswer: string): boolean {
  const normalizedCorrect = normalizeString(correctAnswer);
  const normalizedUser = normalizeString(userAnswer);
  
  const correctWords = normalizedCorrect.split(/\s+/);
  const userWords = normalizedUser.split(/\s+/);

  return correctWords.every(word => userWords.includes(word));
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