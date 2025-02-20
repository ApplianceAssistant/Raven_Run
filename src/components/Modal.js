import React, { useState, useEffect, useRef } from 'react';
import ScrollableContent from './ScrollableContent';
import TextToSpeech from './TextToSpeech';

const Modal = ({ isOpen, onClose, title, content, buttons, type, showTextToSpeech, speak }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [autoPlayTrigger, setAutoPlayTrigger] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    console.log('=== Modal Effect ===');
    console.log('isOpen:', isOpen);
    console.log('Current state:', { isVisible, shouldRender });
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isOpen) {
      console.log('Opening modal');
      setShouldRender(true);
      // Use RAF to ensure DOM is ready
      requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          console.log('Setting modal visible');
          setIsVisible(true);
          setAutoPlayTrigger(prev => prev + 1);
        }, 50);
      });
    } else {
      console.log('Closing modal');
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        console.log('Setting shouldRender false');
        setShouldRender(false);
      }, 300);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up modal effect');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  if (!shouldRender) {
    console.log('Modal not rendering - shouldRender is false');
    return null;
  }

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

  const textToSpeak = `${extractTextContent(speak)}`;

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleOverlayClick}>
      <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
        <div className="modal-header">
          {title && <h2>{title}</h2>}
        </div>
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 55)">
          <div className={`modal-body ${getContentColor()}`}>
            {content}
          </div>
        </ScrollableContent>
        {buttons && buttons.length > 0 && (
          <div className="button-container">
            {showTextToSpeech &&  <TextToSpeech 
            text={textToSpeak} 
            autoPlayTrigger={autoPlayTrigger}
          />}
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