import React, { useState, useEffect } from 'react';

const VoiceSelector = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const DEFAULT_VOICE = 'Google UK English Male';

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
        if (savedVoiceURI && availableVoices.some(voice => voice.voiceURI === savedVoiceURI)) {
          setSelectedVoice(savedVoiceURI);
        } else {
          // Try to set the default voice
          const defaultVoice = availableVoices.find(voice => voice.name === DEFAULT_VOICE && voice.lang === 'en-GB');
          if (defaultVoice) {
            setSelectedVoice(defaultVoice.voiceURI);
            localStorage.setItem('selectedVoiceURI', defaultVoice.voiceURI);
          } else {
            // If default voice is not available, fall back to the first voice
            setSelectedVoice(availableVoices[0].voiceURI);
            localStorage.setItem('selectedVoiceURI', availableVoices[0].voiceURI);
          }
        }
        setIsLoading(false);
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
  }, []);

  const handleVoiceChange = (e) => {
    const voiceURI = e.target.value;
    setSelectedVoice(voiceURI);
    localStorage.setItem('selectedVoiceURI', voiceURI);
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
        value={selectedVoice}
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