import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') ?? 'true'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default'); // default theme

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    document.body.classList.add(theme); // apply theme
  }, [isDarkMode, theme]);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);
  const changeTheme = (newTheme) => {
    console.warn("changeTheme", theme, newTheme);
    document.body.classList.remove(theme); // remove old theme
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeSwitcher = () => {
  const { theme, changeTheme } = useTheme();

  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };

  return (
    <div className="selector">
      <label htmlFor="voice-select">Select Theme:</label>
      <select value={theme}
      onChange={handleThemeChange}
      aria-label="Select Theme"
      className="stylized-select">
        <option value="default">Default</option>
        <option value="pirate-theme">Pirate</option>
        <option value="fairyland-theme">Fairyland</option>
        {/* Add more options here as needed */}
      </select>
    </div>
  );
}