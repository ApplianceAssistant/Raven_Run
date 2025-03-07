import React, { createContext, useContext, useState, useCallback } from 'react';

const SpeechContext = createContext(null);

export function SpeechProvider({ children }) {
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize speech synthesis with a silent utterance
  const initializeSpeech = useCallback(() => {
    if (!hasInteracted) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  // Event handler for any user interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      initializeSpeech();
    }
  }, [hasInteracted, initializeSpeech]);

  // Add global event listeners when the provider mounts
  React.useEffect(() => {
    const events = ['click', 'touchstart', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleInteraction]);

  return (
    <SpeechContext.Provider value={{ hasInteracted, initializeSpeech }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}
