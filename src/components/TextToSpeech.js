import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import { useSettings } from '../utils/SettingsContext';
import { useSpeech } from '../utils/SpeechContext';
import gameService from '../services/GeminiCYOAService';

const TextToSpeech = ({ text, autoPlayTrigger }) => {
  const { settings, updateSetting } = useSettings();
  const { hasInteracted, initializeSpeech } = useSpeech();
  const autoSpeakRef = useRef(settings.autoSpeak);
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(document.readyState === 'complete');
  const { getSelectedVoice, cancelSpeech } = useVoiceManagement();
  const audioRef = useRef(null); // Ref to hold the Audio object

  const extractTextFromReactElement = (element) => {
    if (typeof element === 'string') return element;
    if (Array.isArray(element)) return element.map(extractTextFromReactElement).join(' ');
    if (React.isValidElement(element)) {
      if (typeof element.props.children === 'string') return element.props.children;
      if (Array.isArray(element.props.children)) {
        return element.props.children.map(extractTextFromReactElement).join(' ');
      }
    }
    return '';
  };

  useEffect(() => {
    const textContent = typeof text === 'string'
      ? text
      : React.isValidElement(text)
        ? extractTextFromReactElement(text)
        : '';
    sentencesRef.current = textContent.match(/[^.!?]+[.!?]+/g) || [textContent];
    currentSentenceIndexRef.current = 0;
  }, [text]);

  useEffect(() => {
    const handleLoad = () => setIsPageLoaded(true);
    
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  const playGoogleVoice = async (textToSpeak) => {
    const voiceURI = settings.selectedVoiceURI;
    if (!voiceURI || !voiceURI.startsWith('google:')) return;

    setIsSpeaking(true);
    try {
      const voiceName = voiceURI.replace('google:', '');
      const audioDataUri = await gameService.generateSpeech(textToSpeak, voiceName);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioDataUri);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
    } catch (error) {
      console.error("Error playing Google AI voice:", error);
      setIsSpeaking(false);
      // Optional: Fallback to device voice or show an error
    }
  };

  const speakSentence = useCallback(() => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    try {
      // Cancel any ongoing speech
      cancelSpeech();

      if (currentSentenceIndexRef.current >= sentencesRef.current.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentencesRef.current[currentSentenceIndexRef.current]);
      const selectedVoice = getSelectedVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        currentSentenceIndexRef.current++;
        speakSentence();
      };

      utterance.onerror = (event) => {
        if (event.error === 'not-allowed') {
          console.debug('Speech synthesis initializing...');
        } else if (event.error === 'interrupted') {
          console.debug('Speech synthesis interrupted, this is normal during navigation or updates');
        } else {
          console.error('SpeechSynthesisUtterance error:', event);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error cancelling speech:', error);
    }
  }, [getSelectedVoice]);

  const speak = useCallback(() => {
    const fullText = sentencesRef.current.join(' ');
    const voiceURI = settings.selectedVoiceURI;

    if (voiceURI && voiceURI.startsWith('google:')) {
      playGoogleVoice(fullText);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      currentSentenceIndexRef.current = 0;
      setIsSpeaking(true);
      speakSentence();
    }
  }, [settings.selectedVoiceURI, playGoogleVoice, speakSentence]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cancelSpeech(); // This will stop window.speechSynthesis
    setIsSpeaking(false);
  }, [cancelSpeech]);

  useEffect(() => {
    if (!isPageLoaded) return;
    
    if (settings.autoSpeak && autoPlayTrigger) {
      if (hasInteracted) {
        speak();
      } else {
        initializeSpeech();
        // Try speaking after a short delay to allow initialization
        setTimeout(() => {
          speak();
        }, 100);
      }
    }
  }, [settings.autoSpeak, autoPlayTrigger, hasInteracted, speak, initializeSpeech, isPageLoaded]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  };

  return (
    <div className="tts-controls">
      <button onClick={handleSpeak} className="tts-button">
        <FontAwesomeIcon icon={isSpeaking ? faVolumeMute : faVolumeUp} />
      </button>
    </div>
  );
};

export default TextToSpeech;