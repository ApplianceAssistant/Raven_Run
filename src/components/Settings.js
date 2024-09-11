import React, { useState, useEffect } from 'react';
import ScrollableContent from './ScrollableContent';
import ToggleSwitch from './ToggleSwitch';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  const handleModeToggle = () => {
    setIsDarkMode(!isDarkMode);
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
              <p>More settings coming soon...</p>
            </div>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
};

export default Settings;