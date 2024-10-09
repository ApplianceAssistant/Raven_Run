import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { priorityVoices } from '../utils/voicePriorities';

const TextToSpeech = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const sentencesRef = useRef([]);
  const currentSentenceIndexRef = useRef(0);

  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
      if (savedVoiceURI) {
        const voice = voices.find(v => v.voiceURI === savedVoiceURI);
        setSelectedVoice(voice || voices[0]);
      } else {
        const priorityVoice = priorityVoices.find(pv => 
          voices.some(v => v.name === pv.name && v.lang === pv.lang)
        );
        setSelectedVoice(priorityVoice || voices[0]);
      }
    };

    loadVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoice;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Split text into sentences whenever it changes
    sentencesRef.current = text.match(/[^.!?]+[.!?]+/g) || [text];
    currentSentenceIndexRef.current = 0;
  }, [text]);

  const speakNextSentence = useCallback(() => {
    if (currentSentenceIndexRef.current < sentencesRef.current.length) {
      const utterance = new SpeechSynthesisUtterance(sentencesRef.current[currentSentenceIndexRef.current]);
      utterance.voice = selectedVoice;
      
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
  }, [selectedVoice]);

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