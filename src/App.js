import React, { useState, useRef, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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



import './css/App.scss';
import './css/SpiritGuide.scss';

export const AuthContext = createContext(null);

function BackgroundController() {
  const location = useLocation();

  useEffect(() => {
    // Create moving background elements
    const movingBackground = document.createElement('div');
    movingBackground.className = 'moving-background';

    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      element.className = 'moving-element';

      // Initial position
      element.style.left = `${Math.random() * 100}%`;
      element.style.top = `${Math.random() * 100}%`;

      // Set random animation delays
      element.style.animationDelay = `${Math.random() * 20}s`;
      element.style.animationDuration = `${Math.random() * 4 + 6}s`; // 6-10s duration

      movingBackground.appendChild(element);
    }

    document.body.appendChild(movingBackground);

    // Function to update background visibility
    const updateBackgroundVisibility = () => {
      const noBackgroundPages = ['/profile', '/friends', '/create-profile', '/log-in', '/create', '/about', '/contact', '/thank_you'];
      const shouldShowBackground = !noBackgroundPages.includes(location.pathname);
      movingBackground.classList.toggle('with-background', shouldShowBackground);
    }

    // Initial call to set correct visibility
    updateBackgroundVisibility();

    // Clean up function
    return () => {
      document.body.removeChild(movingBackground);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to update background visibility on route changes
  useEffect(() => {
    const movingBackground = document.querySelector('.moving-background');
    if (movingBackground) {
      const noBackgroundPages = ['/profile', '/friends', '/create-profile', '/log-in', '/create', '/about', '/contact', '/thank_you'];
      const shouldShowBackground = !noBackgroundPages.includes(location.pathname);
      movingBackground.classList.toggle('with-background', shouldShowBackground);
    }
  }, [location]);

  return null; // This component doesn't render anything
}

function AppContent() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locationIntervalRef = useRef(null);
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });
  const [authState, setAuthState] = useState({
    //always logged in for testing
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
    // Check if there's a stored auth token or user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuthState({
        isLoggedIn: true,
        user: JSON.parse(storedUser),
        isLoading: false,
      });
    } else {
      setAuthState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, []);

  const login = (userData) => {
    setAuthState({
      isLoggedIn: true,
      user: userData,
      isLoading: false,
    });
    localStorage.setItem('user', JSON.stringify(userData));
  }

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
      // Optionally, you can still log out the user on the client-side even if the server request fails
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
            <Route path="/thank_you" element={<ThankYou />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/path/:pathId" element={<PathPage />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/log-in" element={<LogIn />} />
            <Route path="/hunt-description/:pathId" element={<HuntDescription />} />
            <Route path="/path/:pathId/challenge/:challengeIndex" element={<PathPage />} />
            <Route path="/congratulations" element={<Congratulations />} />
            <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/create" element={<Create />} />
                <Route path="/friends" element={<Friends />} />
            {authState.isLoggedIn && (
              <>
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/create" element={<Create />} />
                <Route path="/friends" element={<Friends />} />
              </>
            )}
          </Routes>
          <BackgroundController />
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