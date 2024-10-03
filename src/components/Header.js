import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import '../css/Header.scss';

function Header({ isMenuOpen, toggleMenu }) {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    toggleMenu();
    navigate('/');
  };
  
  const getMenuItems = () => {
    if (isLoggedIn) {
      return [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
        //{ label: 'Create', path: '/create' },
        { label: 'Settings', path: '/settings' },
        //{ label: 'Log Out', path: '/logout' }  // We'll handle this specially
      ];
    } else {
      const baseItems = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' }
      ];
      if (location.pathname === '/log-in') {
        return [...baseItems, { label: 'Create Profile', path: '/create-profile' }];
      } else if (location.pathname === '/create-profile') {
        return [...baseItems, { label: 'Log In', path: '/log-in' }];
      } else {
        return [
          ...baseItems,
          { label: 'Create Profile', path: '/create-profile' },
          { label: 'Log In', path: '/log-in' }
        ];
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
              <li key={item.label} className={isMenuOpen ? 'open' : ''} style={{transitionDelay: `${index * 0.1}s`}}>
                <Link 
                  to={item.path}
                  onClick={(e) => {
                    if (item.label === 'Log Out') {
                      handleLogout(e);
                    } else {
                      toggleMenu();
                    }
                  }}
                >
                  {item.label}
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