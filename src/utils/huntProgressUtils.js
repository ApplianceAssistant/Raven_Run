// src/utils/huntProgressUtils.js

const HUNT_PROGRESS_KEY = 'huntProgress';

export const saveHuntProgress = (pathId, challengeIndex) => {
  const progress = { pathId, challengeIndex };
  localStorage.setItem(HUNT_PROGRESS_KEY, JSON.stringify(progress));
};

export const getHuntProgress = () => {
  const progress = localStorage.getItem(HUNT_PROGRESS_KEY);
  return progress ? JSON.parse(progress) : null;
};

export const clearHuntProgress = () => {
  localStorage.removeItem(HUNT_PROGRESS_KEY);
};

export const isHuntInProgress = () => {
  return !!getHuntProgress();
};