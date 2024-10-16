import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import { useSettings } from '../utils/SettingsContext';

const TextToSpeech = ({ text, autoPlayTrigger }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { getSelectedVoice } = useVoiceManagement();
  const { settings } = useSettings();

  const speak = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = getSelectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [text, getSelectedVoice]);

  useEffect(() => {
    if (settings.autoSpeak && autoPlayTrigger) {
      speak();
    }
  }, [settings.autoSpeak, autoPlayTrigger, speak]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speak();
    }
  };

  return (
    <div className="text-to-speech">
      <button onClick={handleSpeak} className="speak-button">
        <FontAwesomeIcon icon={isSpeaking ? faVolumeMute : faVolumeUp} />
      </button>
    </div>
  );
};

export default TextToSpeech;