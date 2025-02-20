import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import { useSettings } from '../utils/SettingsContext';
import { useSpeech } from '../utils/SpeechContext';

const TextToSpeech = ({ text, autoPlayTrigger }) => {
  const { settings, updateSetting } = useSettings();
  const { hasInteracted, initializeSpeech } = useSpeech();
  const autoSpeakRef = useRef(settings.autoSpeak);
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { getSelectedVoice, cancelSpeech } = useVoiceManagement();

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
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    currentSentenceIndexRef.current = 0;
    setIsSpeaking(true);
    speakSentence();
  }, [speakSentence]);

  useEffect(() => {
    if (settings.autoSpeak && autoPlayTrigger) {
      console.warn('speak trigger:', autoPlayTrigger);
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
  }, [settings.autoSpeak, autoPlayTrigger, speak, hasInteracted, initializeSpeech]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      updateSetting('autoSpeak', false);
      setIsSpeaking(false);
    } else {
      speak();
      updateSetting('autoSpeak', true);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="text-to-speech">
      <button onClick={handleSpeak} className="speak-button">
        <FontAwesomeIcon icon={settings.autoSpeak ? faVolumeMute : faVolumeUp} />
      </button>
    </div>
  );
};

export default TextToSpeech;