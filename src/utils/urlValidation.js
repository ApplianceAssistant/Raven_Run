// src/utils/urlValidation.js

import { getHuntProgress } from './huntProgressUtils';

export const validateChallengeUrl = (gameId, challengeIndex) => {
  const huntProgress = getHuntProgress();
  
  if (!huntProgress || huntProgress.gameId !== gameId) {
    // If no progress or different game, start from the beginning
    return 0;
  }

  const lastCompletedIndex = huntProgress.challengeIndex;

  // If trying to access a future challenge, redirect to the last completed + 1
  if (challengeIndex > lastCompletedIndex + 1) {
    return lastCompletedIndex + 1;
  }

  // Otherwise, the requested challenge index is valid
  return challengeIndex;
};