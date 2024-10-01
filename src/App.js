import React, { useState, useRef, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
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
import { checkServerConnectivity, API_URL } from './utils/utils.js';
import { startLocationUpdates, stopLocationUpdates, getCurrentLocation, updateUserLocation } from './utils/utils';


import './css/App.scss';
import './css/SpiritGuide.scss';

// Create a context for the auth state
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
      const noBackgroundPages = ['/profile', '/settings', '/friends', '/create-profile', '/log-in', '/create'];
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
      const noBackgroundPages = ['/profile', '/settings', '/friends', '/create-profile', '/log-in', '/create'];
      const shouldShowBackground = !noBackgroundPages.includes(location.pathname);
      movingBackground.classList.toggle('with-background', shouldShowBackground);
    }
  }, [location]);

  return null; // This component doesn't render anything
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locationIntervalRef = useRef(null);
  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });
  const [authState, setAuthState] = useState({
    //update this to simulate loggin status
    isLoggedIn: false,
    user: null,
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
      });
    }
  }, []);

  const authFetch = async (url, options = {}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token might be expired, log out the user
      logout();
    }

    return response;
  };

  const login = (userData) => {
    setAuthState({
        isLoggedIn: true,
        user: userData,
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

      const data = await response.json();

      if (data.success) {
          setAuthState({
              isLoggedIn: false,
              user: null,
          });
          localStorage.removeItem('user');
      } else {
          console.error('Logout failed:', data.message);
      }
  } catch (error) {
      console.error('Logout error:', error);
  }
};

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  // Start location updates when the app initializes
  if (!locationIntervalRef.current) {
    locationIntervalRef.current = startLocationUpdates();
  }
  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ ...authState, login, logout }}>
        <Router>
          <div className="app">
            <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

            <main className="main-content">

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/path/:pathId" element={<PathPage />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/log-in" element={<LogIn />} />
                {authState.isLoggedIn && (
                  <>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/friends" element={<Friends />} />
                  </>
                )}
              </Routes>
              <BackgroundController></BackgroundController>
            </main>


          </div>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider >
  );
}

export default App;