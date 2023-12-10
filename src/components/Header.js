import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.scss';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Raven Run</Link> {/* Replace with your logo or brand name */}
      </div>
      <nav className={isMenuOpen ? "nav-menu open" : "nav-menu"}>
        <ul>
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li><Link to="/about" onClick={toggleMenu}>About</Link></li>
          <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
        </ul>
      </nav>
      <div className="menu-toggle" onClick={toggleMenu}>
        {isMenuOpen ? '✕' : '☰'}
      </div>
    </header>
  );
}

export default Header;
