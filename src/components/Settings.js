import React from 'react';
import ScrollableContent from './ScrollableContent';
import ToggleSwitch from './ToggleSwitch';
import VoiceSelector from './VoiceSelector';
import { useSettings } from '../utils/SettingsContext';
import { ThemeSwitcher } from '../utils/ThemeContext';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import gameService from '../services/GeminiCYOAService';

function Settings() {
  const { settings, updateSetting } = useSettings();
  const { cancelSpeech } = useVoiceManagement();

  const handleUnitSystemToggle = () => {
    updateSetting('isMetric', !settings.isMetric);
  };

  const handleDarkModeToggle = () => {
    updateSetting('isDarkMode', !settings.isDarkMode);
  };

  const handleAutoSpeakToggle = () => {
    updateSetting('autoSpeak', !settings.autoSpeak);
  };

  const handleVoiceChange = (voiceURI) => {
    updateSetting('selectedVoiceURI', voiceURI);
  };

  const testVoice = async () => {
    // Cancel any currently playing speech
    cancelSpeech();
    
    const testText = "The quick brown fox jumps over the lazy dog";
    const voiceURI = settings.selectedVoiceURI;

    if (voiceURI && voiceURI.startsWith('google:')) {
      try {
        const voiceName = voiceURI.replace('google:', '');
        const audioDataUri = await gameService.generateSpeech(testText, voiceName);
        const audio = new Audio(audioDataUri);
        audio.play();
      } catch (error) {
        console.error("Error testing Google AI voice:", error);
        alert("Could not play the selected AI voice. Please try another.");
      }
    } else {
      const utterance = new SpeechSynthesisUtterance(testText);
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <>
      <ScrollableContent dependencies={['settings']} maxHeight="calc(var(--content-vh, 1vh) * 80)">
        <div className="settings-container">
          <ThemeSwitcher></ThemeSwitcher>
          <ToggleSwitch
            checked={settings.isDarkMode}
            onToggle={handleDarkModeToggle}
            label={settings.isDarkMode ? "Dark Mode" : "Light Mode"}
          />
          <ToggleSwitch
            checked={settings.isMetric}
            onToggle={handleUnitSystemToggle}
            label={settings.isMetric ? "Metric System (km/m)" : "Imperial System (mi/ft)"}
          />
          <ToggleSwitch
            checked={settings.autoSpeak}
            onToggle={handleAutoSpeakToggle}
            label={settings.autoSpeak ? "Auto-Speak On" : "Auto-Speak Off"}
          />

          <div className="voice-settings">
            <VoiceSelector
              onVoiceChange={handleVoiceChange}
            />
            <button onClick={testVoice} className="test-voice-btn">
              Test Voice
            </button>
          </div>

        </div>
      </ScrollableContent>
    </>
  );
}

export default Settings;