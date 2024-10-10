import { useState, useEffect, useCallback } from 'react';
import { priorityVoices } from '../utils/voicePriorities';

export const useVoiceManagement = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => {
    return localStorage.getItem('selectedVoiceURI') || '';
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadVoices = useCallback(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      setIsLoading(false);

      const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
      const savedVoiceExists = availableVoices.some(v => v.voiceURI === savedVoiceURI);

      if (!savedVoiceExists) {
        // Find the highest priority available voice
        const defaultVoice = priorityVoices.find(pv => 
          availableVoices.some(av => av.name === pv.name && av.lang === pv.lang)
        );

        if (defaultVoice) {
          const voice = availableVoices.find(v => v.name === defaultVoice.name && v.lang === defaultVoice.lang);
          setSelectedVoiceURI(voice.voiceURI);
          localStorage.setItem('selectedVoiceURI', voice.voiceURI);
        } else {
          // Fallback to the first available voice if none of the priority voices are available
          setSelectedVoiceURI(availableVoices[0].voiceURI);
          localStorage.setItem('selectedVoiceURI', availableVoices[0].voiceURI);
        }
      } else {
        setSelectedVoiceURI(savedVoiceURI);
      }
    }
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  const setVoice = useCallback((voiceURI) => {
    setSelectedVoiceURI(voiceURI);
    localStorage.setItem('selectedVoiceURI', voiceURI);
  }, []);

  const getSelectedVoice = useCallback(() => {
    const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);
    return selectedVoice || voices[0] || null;
  }, [voices, selectedVoiceURI]);

  return { voices, selectedVoiceURI, isLoading, setVoice, getSelectedVoice };
};