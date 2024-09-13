import React from 'react';

const Compass = ({ direction }) => {
  return (
    <span className="compass" aria-label={`Direction: ${direction}`}>
      ({direction})
    </span>
  );
};

export default Compass;