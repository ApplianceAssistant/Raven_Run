import React, { useState, useEffect } from 'react';
import '../css/SpiritGuide.scss';

function SpiritGuide({ isSmall, distance }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getIntensity = () => {
    if (!isSmall || distance === null) return 0.5; // Default intensity for large guide
    if (distance < 0.1) return 1;
    if (distance < 0.5) return 0.8;
    if (distance < 1) return 0.6;
    if (distance < 5) return 0.4;
    return 0.2;
  };

  const getColor = () => {
    if (!isSmall || distance === null) return '255, 255, 255'; // White for large guide or no distance
    const maxDistance = 5; // Maximum distance in miles
    const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
    const red = Math.round(255 * (1 - normalizedDistance));
    const blue = Math.round(255 * normalizedDistance);
    return `${red}, 0, ${blue}`;
  };

  const intensity = getIntensity();
  const color = getColor();

  return (
    <div 
      className={`${isSmall ? 'spirit-guide-small' : 'spirit-guide-large'} ${isActive ? 'active' : ''}`} 
      style={{
        '--spirit-guide-color': color,
        '--spirit-guide-intensity': intensity,
      }}
    >
    </div>
  );
}

export default SpiritGuide;