import React, { useState, useEffect } from 'react';
import { getTimeUntilSkip } from '../services/challengeService';

const SkipCountdown = ({ challengeState }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilSkip(challengeState));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = getTimeUntilSkip(challengeState);
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeState]);

  if (timeRemaining <= 0) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="skip-countdown">
      Skip available in {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default SkipCountdown;