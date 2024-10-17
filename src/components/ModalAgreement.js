import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';

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
    <div className={`modal-overlay legal ${isVisible ? 'visible' : ''}`}>
      <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <ScrollableContent maxHeight="60vh">
          <div className={`modal-body`}>
            {content}
          </div>
        </ScrollableContent>

        <p className="legal-disclaimer">
        By using CrowTours.com or participating in any scavenger hunt, you confirm that you have read, understood, and agreed to this disclaimer.
        </p>
        <button onClick={onAgree} className="agree-button">Agree</button>
      </div>
    </div>
  );
};

export default ModalAgreement;