import React from 'react';
import { useVoiceManagement } from '../hooks/useVoiceManagement';

const googleVoices = [
  { voiceURI: 'google:echo-en-us', name: 'Echo (US English)', lang: 'en-US' },
  { voiceURI: 'google:sierra-en-us', name: 'Sierra (US English)', lang: 'en-US' },
  { voiceURI: 'google:zephyr-en-us', name: 'Zephyr (US English)', lang: 'en-US' },
  { voiceURI: 'google:aurora-en-gb', name: 'Aurora (UK English)', lang: 'en-GB' },
  { voiceURI: 'google:meadow-en-au', name: 'Meadow (AU English)', lang: 'en-AU' },
];

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
        <optgroup label="Google AI Voices">
          {googleVoices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="Device Voices">
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default VoiceSelector;