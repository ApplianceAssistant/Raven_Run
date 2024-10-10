import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';

const Modal = ({ isOpen, onClose, title, content, buttons, type, showTextToSpeech }) => {
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

  const extractTextContent = (element) => {
    if (typeof element === 'string') return element;
    if (React.isValidElement(element)) {
      return React.Children.toArray(element.props.children)
        .map(child => extractTextContent(child))
        .join(' ');
    }
    if (Array.isArray(element)) {
      return element.map(extractTextContent).join(' ');
    }
    return '';
  };

  const textToSpeak = `${title}. ${extractTextContent(content)}`;

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <ScrollableContent maxHeight="60vh">
          <div className={`modal-body ${getContentColor()}`}>
            {content}
          </div>
        </ScrollableContent>
        {buttons && buttons.length > 0 && (
          <div className="modal-buttons">
            {showTextToSpeech && <TextToSpeech text={textToSpeak} />}
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