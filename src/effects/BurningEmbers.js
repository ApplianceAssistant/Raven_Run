// PirateEffects.js
import React from 'react';

// BurningEmbers React Component
export const BurningEmbers = () => {
  return (
    <>
      {[...Array(30)].map((_, i) => {
        const width = Math.random() * 12 + 10;
        const height = Math.random() * 5 + 2;
        const maxSize = 22;
        const minDuration = 7;
        const maxDuration = 15;
        const sizeFactor = (maxSize - width) / maxSize;
        const animationDuration = minDuration + sizeFactor * (maxDuration - minDuration);
        const swayDistance = Math.random() * 100 - 50;
        const flickerDuration = Math.random() * 0.2 + 0.3;
        const easingOptions = ['ease-in-out', 'ease-in', 'ease-out', 'cubic-bezier(0.42, 0, 0.58, 1)'];
        const easing = easingOptions[Math.floor(Math.random() * easingOptions.length)];

        return (
          <div
            key={i}
            className="burning-ember"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5 + 2}s`,
              animationDuration: `${animationDuration}s`,
              animationTimingFunction: `${easing}`,
              '--sway-distance': `${swayDistance}px`,
              '--flicker-duration': `${flickerDuration}s`,
              '--animation-duration': `${animationDuration}s`,
              '--easing': `${easing}`,
              transform: `
                rotateX(${Math.random() * 360}deg)
                rotateY(${Math.random() * 360}deg)
                rotateZ(${Math.random() * 360}deg)
              `,
            }}
          ></div>
        );
      })}
    </>
  );
};

export default BurningEmbers;