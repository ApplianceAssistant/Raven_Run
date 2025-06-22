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

// --- Streaming Audio Player ---
class AudioPlayer {
  constructor(sampleRate = 24000) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    this.audioQueue = [];
    this.isPlaying = false;
    this.startTime = 0;
  }

  addChunk(chunk) {
    this.audioQueue.push(chunk);
    if (!this.isPlaying) {
      this.playQueue();
    }
  }

  async playQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const chunk = this.audioQueue.shift();

    try {
      const header = createWavHeader(chunk.length, this.audioContext.sampleRate);
      const wavData = new Uint8Array(header.length + chunk.length);
      wavData.set(header, 0);
      wavData.set(chunk, header.length);

      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const currentTime = this.audioContext.currentTime;
      const playAt = this.startTime > currentTime ? this.startTime : currentTime;
      
      source.start(playAt);
      this.startTime = playAt + audioBuffer.duration;

      source.onended = () => this.playQueue();
    } catch (error) {
      console.error('Error playing audio chunk:', error);
      this.isPlaying = false; // Stop if there's an error
    }
  }
}
// --- End Streaming Audio Player ---

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
        console.log(`Testing Google AI voice: ${voiceName}`);
        // --- Streaming Implementation ---
        const player = new AudioPlayer();
        await gameService.generateSpeech(testText, voiceName, (audioChunk) => {
          player.addChunk(audioChunk);
        });
        // --- End Streaming Implementation ---

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