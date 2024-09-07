import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateAccount from './components/CreateAccount';
import Lobby from './components/Lobby';
import PathPage from './components/PathPage';
import Settings from './components/Settings';
import Create from './components/GameCreator';
import Header from './components/Header';
import DevLocationSetter from './dev/locationSetter';
import { startLocationUpdates, stopLocationUpdates, getCurrentLocation, updateUserLocation } from './utils/utils';
import './css/App.scss';
import './css/SpiritGuide.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [useDevLocation, setUseDevLocation] = useState(false);
  const locationIntervalRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Create moving background elements
    const movingBackground = document.createElement('div');
    movingBackground.className = 'moving-background';

    const elements = [];

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
      elements.push(element);
    }

    document.body.appendChild(movingBackground);

    return () => {
      document.body.removeChild(movingBackground);
    };
  }, []);

  const handleDevLocationSet = (location) => {
    // Update the current location in utils.js
    updateUserLocation(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
  };

  const toggleDevMode = () => {
    setUseDevLocation((prevUseDevLocation) => {
      if (prevUseDevLocation) {
        // Switching to real location mode
        localStorage.removeItem('userLocation');
        if (locationIntervalRef.current) {
          stopLocationUpdates(locationIntervalRef.current);
        }
        locationIntervalRef.current = startLocationUpdates();
      } else {
        // Switching to dev location mode
        if (locationIntervalRef.current) {
          stopLocationUpdates(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
      }
      return !prevUseDevLocation;
    });
  };

  // Start location updates when the app initializes
  if (!locationIntervalRef.current && !useDevLocation) {
    locationIntervalRef.current = startLocationUpdates();
  }
  console.log("isLoggedIn: ", isLoggedIn);
  return (
    <Router>
      <div className="app">
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} isLoggedIn={isLoggedIn} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/path/:pathId" element={<PathPage />} />
            <Route path="/lobby" element={<Lobby />} />
            {isLoggedIn && (
              <>
                <Route path="/settings" element={<Settings />} />
                <Route path="/create" element={<Create />} />
              </>
            )}
            {!isLoggedIn && (
              <Route path="/create-account" element={<CreateAccount />} />
            )}
          </Routes>
        </main>
        {process.env.NODE_ENV === 'development' && (
          <div className="dev-tools">
            <button onClick={toggleDevMode} className="dev-toggle-btn">
              {useDevLocation ? 'Use Real Location' : 'Use Dev Location'}
            </button>
            {useDevLocation && <DevLocationSetter onLocationSet={handleDevLocationSet} />}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;