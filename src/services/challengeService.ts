import { Challenge, isStoryChallenge, isMultipleChoiceChallenge, isTrueFalseChallenge, isTravelChallenge  } from '../types/challengeTypes.ts';
import { challenges } from '../data/challenges.ts';

export function getChallenges() {
  // This function remains unchanged
  // It should return the challenges from your data source
  return challenges;
}

const hintIndexMap = new Map<string, number>();

export function getNextLocationHint(challenge: Challenge): string {
  console.log("challenge", challenge);
  if (isTravelChallenge(challenge) && challenge.locationHints.length > 0) {
    let hintIndex = hintIndexMap.get(challenge.id) ?? -1;
    hintIndex = (hintIndex + 1) % challenge.locationHints.length;
    hintIndexMap.set(challenge.id, hintIndex);
    return challenge.locationHints[hintIndex];
  }
  return "No hints available.";
}

export function resetHintCycle(challengeId: string): void {
  hintIndexMap.delete(challengeId);
}

export function checkLocationReached(challenge: Challenge, userLocation: {latitude: number, longitude: number}): boolean {
  if (isTravelChallenge(challenge)) {
    const distance = calculateDistance(userLocation, challenge.targetLocation);
    return distance <= challenge.radius;
  }
  return false;
}

function calculateDistance(loc1: {latitude: number, longitude: number}, loc2: {latitude: number, longitude: number}): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degToRad(loc2.latitude - loc1.latitude);
  const dLon = degToRad(loc2.longitude - loc1.longitude);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degToRad(loc1.latitude)) * Math.cos(degToRad(loc2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance * 1000; // Convert to meters
}

function degToRad(deg: number): number {
  return deg * (Math.PI/180);
}

export function checkAnswer(challenge: Challenge, answer: any): boolean {
  if (isStoryChallenge(challenge)) {
    return true; // Stories are always considered "correct"
  }

  if (isMultipleChoiceChallenge(challenge)) {
    return challenge.correctAnswer == answer;
  }

  if (isTrueFalseChallenge(challenge)) {
    return challenge.correctAnswer == answer;
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

// You can add more functions here as needed for challenge management