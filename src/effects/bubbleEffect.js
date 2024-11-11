import React from 'react';

const BubbleEffect = () => {
  return (
    <>
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            scale: `${Math.random() * 1.5 + 0.8}`, // Randomize scale for size variation
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10 + 2}s`,
            animationDuration: `${Math.random() * 10 + 6}s`,
          }}
        ></div>
      ))}
    </>
  );
};

export default BubbleEffect;
