import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';  // Adjust the import path as needed
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  const { isLoggedIn } = useContext(AuthContext);

  const menuItems = isLoggedIn
    ? ['Home', 'Settings', 'About', 'Contact', 'Create']
    : ['Home', 'Create Account', 'About', 'Contact'];

  return (
    <>
      <header className="header">
        <div className="logo">
          <Link to="/">Crow Tours <span className="versionDisplay">V0.2</span></Link>
        </div>
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {menuItems.map((item, index) => (
              <li key={item} className={isMenuOpen ? 'open' : ''} style={{transitionDelay: `${index * 0.1}s`}}>
                <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} onClick={toggleMenu}>
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