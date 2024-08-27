import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Crow Tours</Link>
      </div>
      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
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