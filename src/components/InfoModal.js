import React from 'react';

const InfoModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Path Creation Information</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <p>Creating a new path:</p>
          <ul>
            <li>Enter a unique name for your path.</li>
            <li>Provide an optional description (max 500 words).</li>
            <li>Click 'Save' to store your path.</li>
            <li>Use 'Next' to start adding challenges to your path.</li>
          </ul>
          <p>Remember to save your progress regularly!</p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;