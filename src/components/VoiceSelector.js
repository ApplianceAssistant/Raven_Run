import React, { useState, useEffect } from 'react';

const VoiceSelector = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
        if (savedVoiceURI && availableVoices.some(voice => voice.voiceURI === savedVoiceURI)) {
          setSelectedVoice(savedVoiceURI);
        } else {
          setSelectedVoice(availableVoices[0].voiceURI);
          localStorage.setItem('selectedVoiceURI', availableVoices[0].voiceURI);
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