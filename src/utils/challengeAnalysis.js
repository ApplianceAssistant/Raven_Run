// src/utils/challengeAnalysis.js

import { calculateDistance } from './utils';
import { kilometersToMiles, getLargeDistanceUnit } from './unitConversion';

export const analyzeChallenges = (challenges, isMetric) => {
  const locationChallenges = challenges.filter(challenge => challenge.targetLocation);
  const totalChallenges = challenges.length;

  if (locationChallenges.length < 2) {
    return {
      totalChallenges,
      maxDistance: null,
      unit: null
    };
  }

  let maxDistance = 0;
  for (let i = 0; i < locationChallenges.length; i++) {
    for (let j = i + 1; j < locationChallenges.length; j++) {
      const distance = calculateDistance(
        locationChallenges[i].targetLocation,
        locationChallenges[j].targetLocation
      );
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
  }

  const distanceInKm = maxDistance / 1000;
  const distanceValue = isMetric ? distanceInKm : kilometersToMiles(distanceInKm);
  const unit = getLargeDistanceUnit(isMetric);

  return {
    totalChallenges,
    maxDistance: distanceValue.toFixed(2),
    unit
  };
};