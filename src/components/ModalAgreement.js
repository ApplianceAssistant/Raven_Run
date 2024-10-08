import React, { useState, useEffect } from 'react';

const ModalAgreement = ({ isOpen, onAgree, title, content }) => {
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

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className={`modal-body`}>
          {content}
        </div>
        <p className="legal-disclaimer">
        By using CrowTours.com or participating in any scavenger hunt, you confirm that you have read, understood, and agreed to this disclaimer.
        </p>
        <button onClick={onAgree} className="agree-button">Agree</button>
      </div>
    </div>
  );
};

export default ModalAgreement;