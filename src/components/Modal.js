import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, content, buttons }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger the fade-in transition
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      // Delay removing the modal to allow fade-out animation
      setTimeout(() => setShouldRender(false), 300); // 300ms matches our CSS transition duration
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
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