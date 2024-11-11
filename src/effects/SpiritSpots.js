import React from 'react';

const SpiritSpots = () => {
  return (
    <>
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="spirit-spot"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${Math.random() * 4 + 6}s`
          }}
        ></div>
      ))}
    </>
  );
};

export default SpiritSpots;
