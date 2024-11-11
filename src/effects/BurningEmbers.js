import React from 'react';

const BurningEmbers = () => {
  return (
    <>
      {[...Array(30)].map((_, i) => {
        // Randomize ember size
        const width = Math.random() * 12 + 10; // Range: 10px to 22px
        const height = Math.random() * 5 + 2; // Range: 2px to 7px

        // Calculate animation duration based on size (larger embers fall faster)
        const maxSize = 22;
        const minDuration = 7;
        const maxDuration = 15;
        const sizeFactor = (maxSize - width) / maxSize;
        const animationDuration = minDuration + sizeFactor * (maxDuration - minDuration);

        // Randomize additional properties
        const swayDistance = Math.random() * 100 - 50; // Range: -50px to 50px
        const flickerDuration = Math.random() * 0.2 + 0.3; // Range: 0.3s to 0.5s
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
