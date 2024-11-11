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
import PathPage from './components/PathPage';
import Settings from './components/Settings';
import Create from './components/GameCreator';
import Header from './components/Header';
import LogIn from './components/LogIn';
import Friends from './components/Friends.js';
import Congratulations from './components/Congratulations';
import ThankYou from './components/ThankYou.js';
import { checkServerConnectivity, API_URL, authFetch } from './utils/utils.js';
import HuntDescription from './components/HuntDescription';
import ThemeContainer from './components/ThemeContainer.js';
import { useTheme } from './utils/ThemeContext';

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
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkServerConnectivity();
      setServerStatus(status);
    };
    checkConnection();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuthState({
        isLoggedIn: true,
        user: JSON.parse(storedUser),
        isLoading: false,
      });
    } else {
      setAuthState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, []);

  const login = (userData) => {
    setAuthState({
      isLoggedIn: true,
      user: userData,
      isLoading: false,
    });
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      const response = await authFetch(`${API_URL}/login.php`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'logout',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAuthState({
          isLoggedIn: false,
          user: null,
        });
        localStorage.removeItem('user');
        navigate('/'); // Redirect to home page after logout
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
      });
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      <div className="app">
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        <main className="main-content">
          <Routes>
            <Route path="/thank_you" element={<ThemeContainer theme={theme}><ThankYou /></ThemeContainer>} />
            <Route path="/" element={<ThemeContainer theme={theme}><Home /></ThemeContainer>} />
            <Route path="/about" element={<ThemeContainer theme={theme}><About /></ThemeContainer>} />
            <Route path="/contact" element={<ThemeContainer theme={theme}><Contact /></ThemeContainer>} />
            <Route path="/path/:pathId" element={<ThemeContainer theme={theme}><PathPage /></ThemeContainer>} />
            <Route path="/lobby" element={<ThemeContainer theme={theme}><Lobby /></ThemeContainer>} />
            <Route path="/create-profile" element={<ThemeContainer theme={theme}><CreateProfile /></ThemeContainer>} />
            <Route path="/log-in" element={<ThemeContainer theme={theme}><LogIn /></ThemeContainer>} />
            <Route path="/hunt-description/:pathId" element={<ThemeContainer theme={theme}><HuntDescription /></ThemeContainer>} />
            <Route path="/path/:pathId/challenge/:challengeIndex" element={<ThemeContainer theme={theme}><PathPage /></ThemeContainer>} />
            <Route path="/congratulations" element={<ThemeContainer theme={theme}><Congratulations /></ThemeContainer>} />
            <Route path="/profile" element={<ThemeContainer theme={theme}><Profile /></ThemeContainer>} />
            <Route path="/settings" element={<ThemeContainer theme={theme}><Settings /></ThemeContainer>} />
            <Route path="/create" element={<ThemeContainer theme={theme}><Create /></ThemeContainer>} />
            <Route path="/friends" element={<ThemeContainer theme={theme}><Friends /></ThemeContainer>} />
            {authState.isLoggedIn && (
              <>
                <Route path="/profile" element={<ThemeContainer theme={theme}><Profile /></ThemeContainer>} />
                <Route path="/settings" element={<ThemeContainer theme={theme}><Settings /></ThemeContainer>} />
                <Route path="/create" element={<ThemeContainer theme={theme}><Create /></ThemeContainer>} />
                <Route path="/friends" element={<ThemeContainer theme={theme}><Friends /></ThemeContainer>} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
