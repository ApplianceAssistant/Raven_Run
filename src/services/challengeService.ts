import { Challenge, isStoryChallenge, isMultipleChoiceChallenge, isTrueFalseChallenge, isTravelChallenge  } from '../types/challengeTypes';
import { calculateDistance } from '../utils/utils';
import { paths } from '../data/challenges';

export function getPath(pathId: number) {
  return paths.find(path => path.id === pathId);
}

export function getChallenges(pathId: number): Challenge[] {
  const path = getPath(pathId);
  return path ? path.challenges : [];
}

export function getPathName(pathId: number): string {
  const path = getPath(pathId);
  //return unknown path and back to loby button
  return path ? path.name : 'Unknown Path';
}

const hintIndexMap = new Map<string, number>();

export function getNextLocationHint(challenge: Challenge): string {
  if (isTravelChallenge(challenge) && challenge.hints.length > 0) {
    let hintIndex = hintIndexMap.get(challenge.id) ?? -1;
    hintIndex = (hintIndex + 1) % challenge.hints.length;
    hintIndexMap.set(challenge.id, hintIndex);
    return challenge.hints[hintIndex];
  }
  return "No hints available.";
}

export function resetHintCycle(challengeId: string): void {
  hintIndexMap.delete(challengeId);
}



export function checkLocationReached(challenge: Challenge, userLocation: {latitude: number, longitude: number}): boolean {
  if (!isTravelChallenge(challenge) || !challenge.targetLocation || !challenge.radius) {
    return false;
  }

  if (!userLocation || typeof userLocation.latitude !== 'number' || typeof userLocation.longitude !== 'number') {
    return false;
  }

  const distance = calculateDistance(userLocation, challenge.targetLocation);
  return distance <= challenge.radius;
}

export function checkAnswer(challenge: Challenge, answer: any): boolean {
  if (isStoryChallenge(challenge)) {
    return true; // Stories are always considered "correct"
  }

  if (isMultipleChoiceChallenge(challenge)) {
    return challenge.correctAnswer === answer;
  }

  if (isTrueFalseChallenge(challenge)) {
    // Ensure both are compared as booleans
    return challenge.correctAnswer === answer;
  }

  // Add more conditions for other challenge types

  // If no conditions are met, consider it incorrect
  return false;
}

const lastFeedbackIndexMap = new Map<string, number>();

export function getNextIncorrectFeedback(challenge: Challenge): string {
  
  if (challenge.feedbackTexts && challenge.feedbackTexts.incorrect && challenge.feedbackTexts.incorrect.length > 0) {
    const incorrectFeedbacks = challenge.feedbackTexts.incorrect;
    // Get the last index used for this challenge, or -1 if it's the first time
    let lastIndex = lastFeedbackIndexMap.get(challenge.id) ?? -1;
    
    // Increment the index, wrapping around to 0 if we've reached the end
    let nextIndex = (lastIndex + 1) % incorrectFeedbacks.length;
    
    // Store the new index
    lastFeedbackIndexMap.set(challenge.id, nextIndex);
    
    // Return the feedback at the new index
    return incorrectFeedbacks[nextIndex];
  }

  return 'Incorrect. Try again.'; // Default message if no specific feedback is available
}

// You may want to add a function to reset the feedback cycle for a challenge
export function resetFeedbackCycle(challengeId: string): void {
  lastFeedbackIndexMap.delete(challengeId);
}

export function canDisplayChallenge(challenge: Challenge, hasBeenDisplayed: boolean): boolean {
  if (isStoryChallenge(challenge)) {
    return challenge.repeatable || !hasBeenDisplayed;
  }
  return true; // Non-story challenges can always be displayed
}

export default {
  checkLocationReached,
  getNextLocationHint,
  checkAnswer,
  getNextIncorrectFeedback
};
// You can add more functions here as needed for challenge management