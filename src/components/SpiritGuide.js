import React, { useState, useEffect } from 'react';
import '../css/SpiritGuide.scss';

function SpiritGuide({ isSmall, distance }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getIntensity = () => {
    if (distance === null) return 0;
    if (distance < 0.1) return 1;
    if (distance < 0.5) return 0.8;
    if (distance < 1) return 0.6;
    if (distance < 5) return 0.4;
    return 0.2;
  };

  const intensity = getIntensity();

  return (
    <div className={`${isSmall ? 'spirit-guide-small' : 'spirit-guide-large'} ${isActive ? 'active' : ''}`} style={{
      animation: isActive
        ? `pulsateActive ${2 / intensity}s ease-in-out infinite alternate, 
             fluctuateActive ${3 / intensity}s ease-in-out infinite alternate`
        : 'pulsateNeutral 4s ease-in-out infinite alternate, fluctuateNeutral 6s ease-in-out infinite alternate'
    }}>
    </div>
  );
}

export default SpiritGuide;