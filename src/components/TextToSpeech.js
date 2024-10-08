import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { useVoiceManagement } from '../hooks/useVoiceManagement';

const TextToSpeech = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { getSelectedVoice } = useVoiceManagement();
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);

  useEffect(() => {
    // Extract text content from React elements if necessary
    const textContent = typeof text === 'string' 
      ? text 
      : React.isValidElement(text)
        ? extractTextFromReactElement(text)
        : '';

    // Split text into sentences
    sentencesRef.current = textContent.match(/[^.!?]+[.!?]+/g) || [textContent];
    currentSentenceIndexRef.current = 0;
  }, [text]);

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

  const speakNextSentence = useCallback(() => {
    if (currentSentenceIndexRef.current < sentencesRef.current.length) {
      const utterance = new SpeechSynthesisUtterance(sentencesRef.current[currentSentenceIndexRef.current]);
      const selectedVoice = getSelectedVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onend = () => {
        currentSentenceIndexRef.current++;
        speakNextSentence();
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  }, [getSelectedVoice]);

  const handleSpeak = useCallback(() => {
    if (!isSpeaking) {
      currentSentenceIndexRef.current = 0;
      setIsSpeaking(true);
      speakNextSentence();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking, speakNextSentence]);

  return (
    <div className="text-to-speech">
      <button onClick={handleSpeak} className="speak-button">
        <FontAwesomeIcon icon={isSpeaking ? faVolumeMute : faVolumeUp} />
      </button>
    </div>
  );
};

export default TextToSpeech;