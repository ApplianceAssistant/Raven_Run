import React from 'react';

const InfoModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Game Creation Information</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p>Creating a new game:</p>
          <ul>
            <li>Enter a unique name for your game.</li>
            <li>Provide an optional description (max 500 words).</li>
            <li>Click 'Save' to store your game.</li>
            <li>Use 'Next' to start adding challenges to your game.</li>
          </ul>
          <p>Remember to save your progress regularly!</p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;