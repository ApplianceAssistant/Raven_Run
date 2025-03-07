import React from 'react';
import { useVoiceManagement } from '../hooks/useVoiceManagement';

const VoiceSelector = ({ onVoiceChange }) => {
  const { voices, selectedVoiceURI, isLoading, setVoice } = useVoiceManagement();

  const handleVoiceChange = (e) => {
    const newVoice = e.target.value;
    setVoice(newVoice);
    if (onVoiceChange) {
      onVoiceChange(newVoice);
    }
  };

  if (isLoading) {
    return <div className="selector">Loading voices...</div>;
  }

  if (voices.length === 0) {
    return <div className="selector">No voices available</div>;
  }

  return (
    <div className="selector">
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