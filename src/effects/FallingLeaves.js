import React from 'react';

const FallingLeaves = () => {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="falling-leaf"
          style={{
            scale: `${Math.random() * 1.7 + 1}`, // Randomize scale for size variation
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10 + 2}s`,
            animationDuration: `${Math.random() * 11 + 7}s`,
            rotate: `${Math.random() * 360}deg`,
          }}
        ></div>
      ))}
    </>
  );
};

export default FallingLeaves;
