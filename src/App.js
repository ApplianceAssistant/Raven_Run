import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateAccount from './components/CreateAccount';
import Lobby from './components/Lobby';
import PathPage from './components/PathPage';
import DevLocationSetter from './dev/locationSetter';
import { getUserLocation } from './utils/utils';
import './css/App.scss';
import './css/SpiritGuide.scss';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [useDevLocation, setUseDevLocation] = useState(false);

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
  
  const fetchUserLocation = useCallback(async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error("Error getting user location:", error);
      // Attempt to retrieve location from localStorage as a fallback
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        setUserLocation(JSON.parse(storedLocation));
      }
    }
  }, []);

  useEffect(() => {
    let locationInterval;
    console.warn("useDevLocation: ", useDevLocation);
    if (useDevLocation) {
      fetchUserLocation();
      locationInterval = setInterval(fetchUserLocation, 60000);
    }

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [useDevLocation, fetchUserLocation]);

  const handleDevLocationSet = (location) => {
    setUserLocation(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
  };

  const toggleDevMode = () => {
    setUseDevLocation(!useDevLocation);
    if (!useDevLocation) {
      // Switching to real location mode
      setUserLocation(null);
      localStorage.removeItem('userLocation');
      fetchUserLocation(); // Immediately fetch the real location
    } else {
      // Switching to dev location mode
      setUserLocation(null); // Reset location when switching to dev mode
    }
  };

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
            <Route path="/path/:pathId" element={<PathPage userLocation={userLocation} />} />
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