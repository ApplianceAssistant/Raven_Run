import React, { useState, useEffect, useMemo } from 'react';

function SpiritGuide({ isSmall, distance, isFirstTransition }) {
  const [isActive, setIsActive] = useState(false);

  const { red, green, blue } = useMemo(() => getColor(distance), [distance]);
  const intensity = useMemo(() => getIntensity(distance), [distance]);

  useEffect(() => {
    const timer = setTimeout(() => setIsActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`spirit-guide large ${isActive ? 'active' : ''}`}
      style={{
        '--spirit-guide-red': red,
        '--spirit-guide-green': green,
        '--spirit-guide-blue': blue,
        '--spirit-guide-intensity': intensity,
      }}
    >
      {/* Spirit guide content */}
    </div>
  );
}

function getColor(distance) {
  if (distance === null) return { red: 255, green: 255, blue: 255 }; // White when no distance
  const maxDistance = 5; // Maximum distance in miles
  const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
  const red = Math.round(255 * (1 - normalizedDistance));
  const blue = Math.round(255 * normalizedDistance);
  return { red, green: 0, blue };
}

function getIntensity(distance) {
  if (distance === null) return 0.5;
  if (distance < 0.1) return 1;
  if (distance < 0.5) return 0.8;
  if (distance < 1) return 0.6;
  if (distance < 5) return 0.4;
  return 0.2;
}

export default SpiritGuide;