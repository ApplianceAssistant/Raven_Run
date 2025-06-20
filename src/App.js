import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from './utils/ThemeContext';
import { SettingsProvider } from './utils/SettingsContext';
import { SpeechProvider } from './utils/SpeechContext';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateProfile from './components/CreateProfile';
import Profile from './components/Profile.js';
import GameLobby from './features/gameLobby/components/GameLobby/GameLobby';
import GamePage from './components/GamePage';
import Settings from './components/Settings';
import { GameCreationProvider } from './features/gameCreation/context/GameCreationContext';
import Create from './features/gameCreation/components/GameCreator/GameCreator';
import ChallengeMapPage from './features/gameCreation/components/ChallengeMapPage';
import Header from './components/Header';
import LogIn from './components/LogIn';
import Friends from './components/Friends.js';
import Congratulations from './components/Congratulations';
import ThankYou from './components/ThankYou.js';
import ResetPassword from './components/ResetPassword';
import { checkServerConnectivity, API_URL, authFetch } from './utils/utils.js';
import HuntDescription from './components/HuntDescription';
import ThemeContainer from './components/ThemeContainer.js';
import { useTheme } from './utils/ThemeContext';
import { MessageProvider } from './utils/MessageProvider';
import MessageDisplay from './components/MessageDisplay';
import Documentation from './components/Documentation';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import GoogleMapsProvider from './components/GoogleMapsProvider';
import GeminiCYOA from './components/GeminiCYOA';
import AdminDashboard from './features/admin/AdminDashboard';

import './css/App.scss';
import { setupViewport } from './utils/viewport';

export const AuthContext = createContext(null);

// Wrapper component to protect routes that require admin access
const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Debugging logs
  console.log('[AdminRoute] Checking access...');
  console.log('[AdminRoute] User object:', user);
  if (user) {
    console.log('[AdminRoute] User role_id:', user.role_id);
    console.log('[AdminRoute] Is user admin?', user.role_id === 1);
  }

  // If user is not logged in or is not an admin, redirect to home page
  if (!user || user.role_id !== 1) {
    console.log('[AdminRoute] Access DENIED. Redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Access GRANTED.');
  return children;
};

function AppContent() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });

  // Initialize user to null. Auth status will be checked via API.
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkServerConnectivity();
      setServerStatus(status);
    };
    checkConnection();

    // Check authentication status on initial load
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const response = await fetch(`${API_URL}/server/api/auth/status.php`, {
          method: 'GET',
          credentials: 'include', // Important for sending cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.isAuthenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user details, not token
          } else {
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // Handle non-OK responses (e.g., server error)
          localStorage.removeItem('user');
          setUser(null);
          console.error('Auth status check failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoadingAuth(false);
    };

    checkAuthStatus();
  }, []);

  const login = (userDetails) => { // userDetails from login.php, no token property
    setUser(userDetails);
    localStorage.setItem('user', JSON.stringify(userDetails)); // Store details, not token
  };

  const logout = async () => {
    try {
      const response = await authFetch(`${API_URL}/server/auth/login.php`, {
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
    isAuthenticated: !!user && !isLoadingAuth, // User is authenticated if user object exists and not loading
    isLoadingAuth,
    login,
    logout,
    // Keep other existing context values if any, or add new ones like serverStatus
    serverStatus,
    setServerStatus
  };

  // Display a loading indicator while checking auth status
  if (isLoadingAuth && !user) { // Added !user to prevent brief flash of loading if user is already in localStorage from previous session and status check is fast
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading application...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <MessageDisplay />
      <div className="main-content">
        <GoogleMapsProvider>
          <Routes>
            <Route path="/thank_you" element={<ThemeContainer theme={theme}><ThankYou /></ThemeContainer>} />
            <Route path="/" element={<ThemeContainer theme={theme}><Home /></ThemeContainer>} />
            <Route path="/cyoa" element={<ThemeContainer theme={theme}><GeminiCYOA /></ThemeContainer>} />
            <Route path="/log-in" element={<ThemeContainer theme={theme}><LogIn /></ThemeContainer>} />
            <Route path="/about" element={<ThemeContainer theme={theme}><About /></ThemeContainer>} />
            <Route path="/contact" element={<ThemeContainer theme={theme}><Contact /></ThemeContainer>} />
            <Route path="/game/:gameId" element={<ThemeContainer theme={theme}><GamePage /></ThemeContainer>} />
            <Route path="/lobby" element={<ThemeContainer theme={theme}><GameLobby /></ThemeContainer>} />
            <Route path="/create-profile" element={<ThemeContainer theme={theme}><CreateProfile /></ThemeContainer>} />
            <Route path="/reset-password" element={<ThemeContainer theme={theme}><ResetPassword /></ThemeContainer>} />
            <Route path="/gamedescription/:gameId" element={<ThemeContainer theme={theme}><HuntDescription /></ThemeContainer>} />
            <Route path="/game/:gameId/challenge/:challengeIndex" element={<ThemeContainer theme={theme}><GamePage /></ThemeContainer>} />
            <Route path="/congratulations" element={<ThemeContainer theme={theme}><Congratulations /></ThemeContainer>} />
            <Route path="/profile" element={<ThemeContainer theme={theme}><Profile /></ThemeContainer>} />
            <Route path="/profile/:tab" element={<ThemeContainer theme={theme}><Profile /></ThemeContainer>} />
            <Route path="/documentation" element={<ThemeContainer theme={theme}><Documentation /></ThemeContainer>} />
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
            <Route path="/challenge-map" element={
              <GameCreationProvider>
                <ThemeContainer theme={theme}>
                  <ChallengeMapPage />
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
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <ThemeContainer theme={theme}>
                    <AdminDashboard />
                  </ThemeContainer>
                </AdminRoute>
              }
            />
            <Route path="/privacy" element={<ThemeContainer theme={theme}><PrivacyPolicy /></ThemeContainer>} />
            <Route path="/terms" element={<ThemeContainer theme={theme}><TermsOfService /></ThemeContainer>} />
            {/* Add a catch-all route for 404s */}
            <Route path="*" element={
              <div className="content-wrapper">
                <div className="bodyContent">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              </div>
            } />
          </Routes>
        </GoogleMapsProvider>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  useEffect(() => {
    let cleanup = setupViewport();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <SettingsProvider>
          <SpeechProvider>
            <MessageProvider>
              <AppContent />
            </MessageProvider>
          </SpeechProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
