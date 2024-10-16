import React, { useState, useEffect, useCallback } from 'react';
import ScrollableContent from './ScrollableContent';
import ToggleSwitch from './ToggleSwitch';
import VoiceSelector from './VoiceSelector';
import { useTheme } from './ThemeContext';

function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });

  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => {
    return localStorage.getItem('selectedVoiceURI') || '';
  });

  useEffect(() => {
    localStorage.setItem('unitSystem', JSON.stringify(isMetric));
  }, [isMetric]);

  const handleUnitSystemToggle = () => {
    setIsMetric(prevMetric => !prevMetric);
  };

  const handleVoiceChange = useCallback((voiceURI) => {
    setSelectedVoiceURI(voiceURI);
    localStorage.setItem('selectedVoiceURI', voiceURI);
  }, []);

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("The quick brown fox jumps over the lazy dog");
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="base-page">
      <div className="content-wrapper">
        <div className="content">
          <ScrollableContent maxHeight="60vh">
            <div className="base-container">
              <ToggleSwitch
                isChecked={isDarkMode}
                onToggle={toggleDarkMode}
                label={isDarkMode ? "Dark Mode" : "Light Mode"}
              />
              <ToggleSwitch
                isChecked={isMetric}
                onToggle={handleUnitSystemToggle}
                label={isMetric ? "Metric System (km/m)" : "Imperial System (mi/ft)"}
              />
              <div className="voice-settings">
                <VoiceSelector
                  selectedVoiceURI={selectedVoiceURI}
                  onVoiceChange={handleVoiceChange}
                />
                <button onClick={testVoice} className="test-voice-button">
                  Test Voice
                </button>
              </div>
            </div>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Settings;