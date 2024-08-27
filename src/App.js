import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import CreateAccount from './components/CreateAccount';
import Lobby from './components/Lobby';
import './css/App.scss';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="app">
        <div className="mist"></div>
        <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
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
    </Router>
  );
}

export default App;