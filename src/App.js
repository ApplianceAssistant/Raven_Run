import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './utils/ThemeContext';
import { SettingsProvider } from './utils/SettingsContext';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateProfile from './components/CreateProfile';
import Profile from './components/Profile.js';
import Lobby from './components/Lobby';
import GamePage from './components/GamePage';
import Settings from './components/Settings';
import { GameCreationProvider } from './features/gameCreation/context/GameCreationContext';
import Create from './features/gameCreation/components/GameCreator/GameCreator';
import Header from './components/Header';
import LogIn from './components/LogIn';
import Friends from './components/Friends.js';
import Congratulations from './components/Congratulations';
import ThankYou from './components/ThankYou.js';
import { checkServerConnectivity, API_URL, authFetch } from './utils/utils.js';
import HuntDescription from './components/HuntDescription';
import ThemeContainer from './components/ThemeContainer.js';
import { useTheme } from './utils/ThemeContext';
import { MessageProvider } from './utils/MessageProvider';
import MessageDisplay from './components/MessageDisplay';

import './css/App.scss';

export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkServerConnectivity();
      setServerStatus(status);
    };
    checkConnection();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/login.php`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'logout',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server request fails, clear local state
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const authContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className={`app ${theme}`}>
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <MessageDisplay />
        <div className="main-content">
          <Routes>
            <Route path="/thank_you" element={<ThemeContainer theme={theme}><ThankYou /></ThemeContainer>} />
            <Route path="/" element={<ThemeContainer theme={theme}><Home /></ThemeContainer>} />
            <Route path="/about" element={<ThemeContainer theme={theme}><About /></ThemeContainer>} />
            <Route path="/contact" element={<ThemeContainer theme={theme}><Contact /></ThemeContainer>} />
            <Route path="/game/:gameId" element={<ThemeContainer theme={theme}><GamePage /></ThemeContainer>} />
            <Route path="/lobby" element={<ThemeContainer theme={theme}><Lobby /></ThemeContainer>} />
            <Route path="/create-profile" element={<ThemeContainer theme={theme}><CreateProfile /></ThemeContainer>} />
            <Route path="/log-in" element={<ThemeContainer theme={theme}><LogIn /></ThemeContainer>} />
            <Route path="/hunt-description/:gameId" element={<ThemeContainer theme={theme}><HuntDescription /></ThemeContainer>} />
            <Route path="/game/:gameId/challenge/:challengeIndex" element={<ThemeContainer theme={theme}><GamePage /></ThemeContainer>} />
            <Route path="/congratulations" element={<ThemeContainer theme={theme}><Congratulations /></ThemeContainer>} />
            <Route path="/profile" element={<ThemeContainer theme={theme}><Profile /></ThemeContainer>} />
            <Route path="/settings" element={<ThemeContainer theme={theme}><Settings /></ThemeContainer>} />
            <Route path="/friends" element={<ThemeContainer theme={theme}><Friends /></ThemeContainer>} />
            {authContextValue.isAuthenticated && (
              <>
                <Route path="/hunt-description" element={<ThemeContainer theme={theme}><HuntDescription /></ThemeContainer>} />
                <Route path="/thankyou" element={<ThemeContainer theme={theme}><ThankYou /></ThemeContainer>} />
              </>
            )}
            <Route path="/create" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
            <Route path="/create/new" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
            <Route path="/create/edit/:gameId" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
            <Route path="/create/edit/:gameId/challenges" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
            <Route path="/create/challenge/:gameId" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
            <Route path="/create/challenge/:gameId/:challengeId" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <Create />
                </ThemeContainer>
              </GameCreationProvider>
            } />
          </Routes>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SettingsProvider>
          <MessageProvider>
            <AppContent />
          </MessageProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
