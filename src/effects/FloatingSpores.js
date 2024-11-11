import React from 'react';

const FloatingSpores = () => {
  return (
    <>
      {[...Array(50)].map((_, i) => {
        const scale = Math.random() * 1.5 + 0.5; // Random scale between 0.5 and 2
        const animationDuration = Math.random() * 20 + 10; // Random duration between 10s and 30s
        const driftDelay = Math.random() * 15; // Random delay up to 15s
        const opacity = Math.random() * 0.6 + 0.2; // Random opacity between 0.2 and 0.8

        return (
          <div
            key={i}
            className="spore"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${driftDelay}s`,
              animationDuration: `${animationDuration}s`,
              opacity,
              scale,
            }}
          ></div>
        );
      })}
    </>
  );
};

export default FloatingSpores;
