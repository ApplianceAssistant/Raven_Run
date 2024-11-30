// src/utils/huntProgressUtils.js

const HUNT_PROGRESS_KEY = 'huntProgress';

export const saveHuntProgress = (gameId, challengeIndex) => {
  const progress = {
    gameId: parseInt(gameId, 10),
    challengeIndex: parseInt(challengeIndex, 10),
    timestamp: Date.now()
  };
  localStorage.setItem(HUNT_PROGRESS_KEY, JSON.stringify(progress));
};

export const getHuntProgress = () => {
  const progressString = localStorage.getItem(HUNT_PROGRESS_KEY);
  return progressString ? JSON.parse(progressString) : null;
};

export const clearHuntProgress = () => {
  localStorage.removeItem(HUNT_PROGRESS_KEY);
};

export const isHuntInProgress = () => {
  return !!getHuntProgress();
};


