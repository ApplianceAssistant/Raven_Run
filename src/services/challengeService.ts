import { Challenge, hasTargetLocation, hasHints } from '../types/challengeTypes';
import { Game } from '../types/games';
import { calculateDistance, getCurrentLocation, getUserUnitPreference } from '../utils/utils';
import { kilometersToMiles, metersToFeet, getLargeDistanceUnit, getSmallDistanceUnit } from '../utils/unitConversion';
import { isStoryChallenge, isMultipleChoiceChallenge, isTrueFalseChallenge, isTextInputChallenge, isTravelChallenge } from '../types/challengeTypes';
import { getDownloadedGame, getAllDownloadedGames } from '../utils/localStorageUtils';
import { getHuntProgress } from '../utils/huntProgressUtils';

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

export function updateDistance(challenge: Challenge, userLocation: { latitude: number, longitude: number }): {
  distance: number | null, 
  displayValue: string, 
  unit: string,
  direction: string 
} {
  if (userLocation && hasTargetLocation(challenge)) {
    const { distance, displayValue, unit, direction } = calculateDistanceInfo(userLocation, challenge.targetLocation!);
    return { distance, displayValue, unit, direction };
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
  console.warn("challenge: ", challenge, "state: ", state);
  switch (challenge.type) {
    case 'story':
      console.log("story challenge");
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

  const huntProgress = getHuntProgress();
  if (huntProgress && huntProgress.challengeIndex > challenge.id) {
    return true;
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
export const getNextHintState = (challenge: Challenge, prevState: ChallengeState): ChallengeState => {
  if (!challenge.hints || challenge.hints.length === 0) {
    return prevState;
  }

  const nextHintIndex = ((prevState.currentHint ?? -1) + 1) % challenge.hints.length;
  return {
    ...prevState,
    currentHint: nextHintIndex,
    hint: challenge.hints[nextHintIndex]
  };
};

// Map to keep track of hint indices for each challenge
const hintIndexMap = new Map<string, number>();

export function getGame(gameId: string) {
  const game = getDownloadedGame(gameId);
  if (!game) return null;

  // Convert challenges to proper type if needed
  const challenges = game.challenges?.map(challenge => ({
    ...challenge,
    order: challenge.order || 0,
    repeatable: challenge.repeatable || false,
    completionFeedback: challenge.completionFeedback || ''
  })) || [];

  return {
    ...game,
    challenges
  };
}

export function getChallenges(gameId: string): Challenge[] {
  const game = getGame(gameId);
  return game?.challenges || [];
}

export function getGameTitle(gameId: string): string {
  const game = getGame(gameId);
  return game?.title || 'Unknown Game';
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

export function checkLocationReached(challenge: Challenge, userLocation: { latitude: number, longitude: number }): { isReached: boolean, distance: number } {
  if (!hasTargetLocation(challenge) || !challenge.radius || !userLocation || typeof userLocation.latitude !== 'number' || typeof userLocation.longitude !== 'number') {
    return { isReached: false, distance: Infinity };
  }

  const { distanceInMeters } = calculateDistanceInfo(userLocation, challenge.targetLocation!);
  return { 
    isReached: distanceInMeters <= challenge.radius,
    distance: distanceInMeters
  };
}

//helper function to consolidate distance calculation
function calculateDistanceInfo(userLocation: { latitude: number, longitude: number }, targetLocation: { latitude: number, longitude: number }) {
  const isMetric = getUserUnitPreference();
  const distanceInMeters = calculateDistance(userLocation, targetLocation);
  const direction = calculateDirection(userLocation, targetLocation);

  let distance: number;
  let displayValue: string;
  let unit: string;

  if (distanceInMeters < 300) {
    // Use smaller units (feet or meters) for distances less than 1km
    distance = isMetric ? distanceInMeters : metersToFeet(distanceInMeters);
    displayValue = Math.round(distance).toString();
    unit = getSmallDistanceUnit(isMetric);
  } else {
    // Use larger units (miles or kilometers) for distances 1km or greater
    const distanceInKilometers = distanceInMeters / 1000;
    distance = isMetric ? distanceInKilometers : kilometersToMiles(distanceInKilometers);
    displayValue = distance.toFixed(2);
    unit = getLargeDistanceUnit(isMetric);
  }

  return { distance, displayValue, unit, direction, distanceInMeters };
}

export function handleSubmit(challenge: Challenge, state: ChallengeState): ChallengeState {
  const isCorrect = checkAnswer(challenge, state.answer, state);
  
  let correctAnswer: string | boolean | undefined;
  if (isMultipleChoiceChallenge(challenge) || isTextInputChallenge(challenge)) {
    correctAnswer = challenge.correctAnswer;
  } else if (isTrueFalseChallenge(challenge)) {
    correctAnswer = challenge.correctAnswer ? 'true' : 'false';
  } else if (isTravelChallenge(challenge)) {
    correctAnswer = 'Location reached';
  }

  const feedbackText = isCorrect 
    ? challenge.feedbackTexts?.correct || 'Correct!'
    : getNextIncorrectFeedback(challenge);

  return {
    ...state,
    isCorrect,
    feedback: feedbackText,
  };
}

export function checkAnswer(challenge: Challenge, answer: any, state: ChallengeState): boolean {
  if (isStoryChallenge(challenge)) {
    return true; // Stories are always considered "correct"
  } else if (isMultipleChoiceChallenge(challenge)) {
    return normalizeString(challenge.correctAnswer) === normalizeString(answer);
  } else if (isTextInputChallenge(challenge)) {
    return checkTextInputAnswer(challenge.correctAnswer, answer);
  } else if (isTrueFalseChallenge(challenge)) {
    return challenge.correctAnswer === answer;
  } else if (isTravelChallenge(challenge)) {
    return state.isLocationReached; // Use the state to check if the location is reached
  }
  return false;
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
  
  if (updates.isLocationReached !== undefined) {
    newState.isLocationReached = updates.isLocationReached;
  } else if (updates.answer !== undefined) {
    newState.isAnswerSelected = true;
    newState.feedback = '';
  }

  return newState;
}

export function shouldDisplaySubmitButton(challenge: Challenge, state: ChallengeState): boolean {
  return state.isAnswerSelected && !state.isCorrect;
}

export default {
  getGame,
  getChallenges,
  getGameTitle,
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