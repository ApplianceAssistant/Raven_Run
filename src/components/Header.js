import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  const getMenuItems = () => {
    if (isLoggedIn) {
      return ['Home', 'About', 'Contact', 'Create', 'Settings', 'Log Out'];
    } else {
      const baseItems = ['Home', 'About', 'Contact'];
      if (location.pathname === '/log-in') {
        return [...baseItems, 'Create Profile'];
      } else if (location.pathname === '/create-profile') {
        return [...baseItems, 'Log In'];
      } else {
        return [...baseItems, 'Create Profile', 'Log In'];
      }
    }
  };

  const isProfileGroup = ['/profile', '/settings', '/friends'].includes(location.pathname);

  const menuItems = getMenuItems();

  const subNavItems = [
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
    { path: '/friends', label: 'Friends' }
  ];

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
      {isProfileGroup && isLoggedIn && (
        <nav className="sub-nav-container">
          <ul className="sub-nav">
            {subNavItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className={`menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
    </>
  );
}

export default Header;