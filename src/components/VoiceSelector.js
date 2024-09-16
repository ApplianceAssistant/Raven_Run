import React, { useState, useEffect } from 'react';
import { priorityVoices } from '../utils/voicePriorities';

const VoiceSelector = ({ selectedVoiceURI, onVoiceChange }) => {
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setIsLoading(false);

        if (!selectedVoiceURI || !availableVoices.some(v => v.voiceURI === selectedVoiceURI)) {
          // Find the highest priority available voice
          const defaultVoice = priorityVoices.find(pv => 
            availableVoices.some(av => av.name === pv.name && av.lang === pv.lang)
          );

          if (defaultVoice) {
            const voice = availableVoices.find(v => v.name === defaultVoice.name && v.lang === defaultVoice.lang);
            onVoiceChange(voice.voiceURI);
          } else {
            // Fallback to the first available voice if none of the priority voices are available
            onVoiceChange(availableVoices[0].voiceURI);
          }
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceURI, onVoiceChange]);

  const handleVoiceChange = (e) => {
    onVoiceChange(e.target.value);
  };

  if (isLoading) {
    return <div className="voice-selector">Loading voices...</div>;
  }

  if (voices.length === 0) {
    return <div className="voice-selector">No voices available</div>;
  }

  return (
    <div className="voice-selector">
      <label htmlFor="voice-select">Select Voice:</label>
      <select
        id="voice-select"
        value={selectedVoiceURI}
        onChange={handleVoiceChange}
        className="stylized-select"
      >
        {voices.map((voice) => (
          <option key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;