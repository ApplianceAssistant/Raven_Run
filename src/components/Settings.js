import React from 'react';
import ScrollableContent from './ScrollableContent';
import ToggleSwitch from './ToggleSwitch';
import VoiceSelector from './VoiceSelector';
import { useSettings } from '../utils/SettingsContext';
import { ThemeSwitcher } from '../utils/ThemeContext';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import gameService from '../services/GeminiCYOAService';

// Helper function to create a WAV file header
function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  // File size
  view.setUint32(4, 36 + dataLength, true);
  // WAVE identifier
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  // fmt chunk identifier
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  // Chunk size
  view.setUint32(16, 16, true);
  // Audio format (1 for PCM)
  view.setUint16(20, 1, true);
  // Number of channels
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  // Block align
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  // Bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  // data chunk size
  view.setUint32(40, dataLength, true);

  return new Uint8Array(header);
}

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
        
        // --- Web Audio API Implementation ---
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const base64Data = audioDataUri.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const rawPcmData = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          rawPcmData[i] = binaryString.charCodeAt(i);
        }
        
        // 1. Create the WAV header
        const header = createWavHeader(rawPcmData.length);
        // 2. Combine header and PCM data into a single buffer
        const wavData = new Uint8Array(header.length + rawPcmData.length);
        wavData.set(header, 0);
        wavData.set(rawPcmData, header.length);

        // 3. Decode the complete WAV file data
        const audioBuffer = await audioContext.decodeAudioData(wavData.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        // --- End Web Audio API Implementation ---

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