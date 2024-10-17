import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useVoiceManagement } from '../hooks/useVoiceManagement';
import { useSettings } from '../utils/SettingsContext';

const TextToSpeech = ({ text, autoPlayTrigger }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { getSelectedVoice } = useVoiceManagement();
  const { settings, updateSetting } = useSettings();
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);

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
      console.error('SpeechSynthesisUtterance error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
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
      speak();
    }
  }, [settings.autoSpeak, autoPlayTrigger, speak]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      updateSetting('autoSpeak', false);
    } else {
      speak();
      updateSetting('autoSpeak', true);
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