import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';  // Adjust the import path as needed
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  const getMenuItems = () => {
    if (isLoggedIn) {
      return ['Home', 'Account', 'Settings', 'About', 'Contact', 'Create'];
    } else {
      const baseItems = ['Home', 'About', 'Contact'];
      if (location.pathname === '/log-in') {
        return [...baseItems, 'Create Account'];
      } else if (location.pathname === '/create-account') {
        return [...baseItems, 'Log In'];
      } else {
        return [...baseItems, 'Create Account', 'Log In'];
      }
    }
  };

  const menuItems = getMenuItems();

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
                <Link 
                  to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                  onClick={toggleMenu}
                >
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