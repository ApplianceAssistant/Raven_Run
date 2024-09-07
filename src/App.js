import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateAccount from './components/CreateAccount';
import Lobby from './components/Lobby';
import PathPage from './components/PathPage';
import DevLocationSetter from './dev/locationSetter';
import { startLocationUpdates, stopLocationUpdates, getCurrentLocation, updateUserLocation } from './utils/utils';
import './css/App.scss';
import './css/SpiritGuide.scss';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [useDevLocation, setUseDevLocation] = useState(false);
  const locationIntervalRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  return (
    <Router>
      <div className="app">
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route 
              path="/path/:pathId" 
              element={<PathPage />} 
            />
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