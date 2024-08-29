import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateAccount from './components/CreateAccount';
import Lobby from './components/Lobby';
import './css/App.scss';
import { handleScroll } from './utils/utils';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Toggle body class when menu opens/closes
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);
  
  useEffect(() => {
    // Create moving background elements
    const movingBackground = document.createElement('div');
    movingBackground.className = 'moving-background';
    for (let i = 0; i < 20; i++) {
      const element = document.createElement('div');
      element.className = 'moving-element';
      element.style.left = `${Math.random() * 100}%`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.animationDelay = `${Math.random() * 10}s`;
      movingBackground.appendChild(element);
    }
    document.body.appendChild(movingBackground);

    return () => {
      document.body.removeChild(movingBackground);
    };
  }, []);

  useEffect(() => {
    const bodyContent = document.querySelector('.bodyContent');
    bodyContent.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => bodyContent.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <div className="app">
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        <div>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/lobby" element={<Lobby />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;