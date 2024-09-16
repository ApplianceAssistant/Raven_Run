import React, { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, content, buttons, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getContentColor = () => {
    switch (type) {
      case 'hint':
        return 'text-orange-700';
      case 'correct':
        return 'text-green-600';
      case 'incorrect':
        return 'text-crimson';
      default:
        return '';
    }
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className={`modal-body ${getContentColor()}`}>
          {content}
        </div>
        {buttons && buttons.length > 0 && (
          <div className="modal-buttons">
            {buttons.map((button, index) => (
              <button key={index} onClick={button.onClick} className={button.className}>
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