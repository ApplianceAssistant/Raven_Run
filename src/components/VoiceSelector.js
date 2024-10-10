import React from 'react';
import { useVoiceManagement } from '../hooks/useVoiceManagement';

const VoiceSelector = () => {
  const { voices, selectedVoiceURI, isLoading, setVoice } = useVoiceManagement();

  const handleVoiceChange = (e) => {
    setVoice(e.target.value);
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