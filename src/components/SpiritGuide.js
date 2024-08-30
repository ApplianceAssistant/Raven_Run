import React, { useState, useEffect } from 'react';

function SpiritGuide({ distance }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getIntensity = () => {
    if (distance === null) return 0;
    // Adjust these thresholds as needed
    if (distance < 0.1) return 1; // Very close
    if (distance < 0.5) return 0.8;
    if (distance < 1) return 0.6;
    if (distance < 5) return 0.4;
    return 0.2; // Far away
  };

  const intensity = getIntensity();

  return (
    <div className={`spirit-guide-small ${isActive ? 'active' : ''}`}>
      <div className="inner-oval" style={{
        animation: isActive 
          ? `pulsateActive ${2 / intensity}s ease-in-out infinite alternate, 
             fluctuateActive ${3 / intensity}s ease-in-out infinite alternate`
          : 'pulsateNeutral 4s ease-in-out infinite alternate, fluctuateNeutral 6s ease-in-out infinite alternate'
      }}></div>
    </div>
  );
}

export default SpiritGuide;