import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => ({
    isDarkMode: JSON.parse(localStorage.getItem('darkMode') || 'false'),
    isMetric: JSON.parse(localStorage.getItem('unitSystem') || 'false'),
    selectedVoiceURI: localStorage.getItem('selectedVoiceURI') || '',
    autoSpeak: JSON.parse(localStorage.getItem('autoSpeak') || 'false'),
  }));

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(settings.isDarkMode));
    document.body.classList.toggle('dark-mode', settings.isDarkMode);
  }, [settings.isDarkMode]);

  useEffect(() => {
    localStorage.setItem('unitSystem', JSON.stringify(settings.isMetric));
  }, [settings.isMetric]);

  useEffect(() => {
    localStorage.setItem('selectedVoiceURI', settings.selectedVoiceURI);
  }, [settings.selectedVoiceURI]);

  useEffect(() => {
    localStorage.setItem('autoSpeak', JSON.stringify(settings.autoSpeak));
  }, [settings.autoSpeak]);

  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({ ...prevSettings, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};