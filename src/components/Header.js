import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  return (
    <>
      <header className="header">
        <div className="logo">
          <Link to="/">Crow Tours</Link>
        </div>
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {['Home', 'About', 'Contact'].map((item, index) => (
              <li key={item} className={isMenuOpen ? 'open' : ''} style={{transitionDelay: `${index * 0.1}s`}}>
                <Link to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} onClick={toggleMenu}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </div>
      </header>
      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
    </>
  );
}
 

export default Header;