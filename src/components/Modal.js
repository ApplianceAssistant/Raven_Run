import React from 'react';

const Modal = ({ isOpen, onClose, title, content, buttons }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {content}
        </div>
        {buttons && buttons.length > 0 && (
          <div className="modal-buttons">
            {buttons.map((button, index) => (
              <button key={index} onClick={button.onClick}>
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;