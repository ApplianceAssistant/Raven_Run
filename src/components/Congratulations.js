// src/components/Congratulations.js
import React, { useEffect, useState } from 'react';

const Congratulations = ({ onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className={`congratulations-container ${visible ? 'visible' : ''}`}>
      <div className="floating-ghost"></div>
      <h1>The spirits have been appeased!</h1>
      <p>Your bravery and wit have led you to victory in the world of shadow.</p>
      <p>Let your friends know about your paranormal prowess!</p>
      <a 
        href="https://www.facebook.com/YourPageHere" 
        target="_blank" 
        rel="noopener noreferrer"
        className="facebook-link"
      >
        Haunt our Facebook page with your presence - give us a like!
      </a>
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  );
};

export default Congratulations;