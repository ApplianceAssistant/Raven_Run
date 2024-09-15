import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import ToggleSwitch from './ToggleSwitch';
import VoiceSelector from './VoiceSelector';

function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('unitSystem', JSON.stringify(isMetric));
  }, [isMetric]);

  const handleModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleUnitSystemToggle = () => {
    setIsMetric(!isMetric);
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Your Settings</h1>
          <ScrollableContent maxHeight="60vh">
            <div className="settings-container">
              <ToggleSwitch
                isChecked={isDarkMode}
                onToggle={handleModeToggle}
                label={isDarkMode ? "Dark Mode" : "Light Mode"}
              />
              <ToggleSwitch
                isChecked={isMetric}
                onToggle={handleUnitSystemToggle}
                label={isMetric ? "Metric System (km/m)" : "Imperial System (mi/ft)"}
              />
              <VoiceSelector />
              <p>More settings coming soon...</p>
            </div>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Settings;