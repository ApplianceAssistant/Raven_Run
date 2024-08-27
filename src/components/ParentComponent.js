import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';

function ParentComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <Home toggleMenu={toggleMenu} />
    </div>
  );
}

export default ParentComponent;
