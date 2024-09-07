import { Challenge, hasTargetLocation, hasHints } from '../types/challengeTypes';
import { calculateDistance } from '../utils/utils';
import { paths } from '../data/challenges';

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

export function getNextLocationHint(challenge: Challenge): string {
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

export function checkLocationReached(challenge: Challenge, userLocation: {latitude: number, longitude: number}): boolean {
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
      return challenge.correctAnswer === answer;
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

export default {
  getPath,
  getChallenges,
  getPathName,
  getNextLocationHint,
  resetHintCycle,
  checkLocationReached,
  checkAnswer,
  getNextIncorrectFeedback,
  resetFeedbackCycle,
  canDisplayChallenge,
  canDisplayHints,
  canDisplayDistance
};