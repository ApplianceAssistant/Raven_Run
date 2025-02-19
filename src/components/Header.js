import React, { useContext, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import '../css/App.scss';

function Header({ isMenuOpen, setIsMenuOpen }) {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const menuToggleRef = useRef(null);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };
  
  const getMenuItems = () => {
    if (isAuthenticated) {
      return [
        { label: 'Home', game: '/' },
        { label: 'About', game: '/about' },
        { label: 'Contact', game: '/contact' },
        { label: 'Profile', game: '/profile' },
        { label: 'Settings', game: '/profile/settings' },
        { label: 'Friends', game: '/profile/friends' },
        { label: 'Log Out', game: '/logout' }  // We'll handle this specially
      ];
    } else {
      const baseItems = [
        { label: 'Home', game: '/' },
        { label: 'About', game: '/about' },
        { label: 'Contact', game: '/contact' },
        { label: 'Settings', game: '/profile/settings' },
      ];
      if (location.pathname === '/log-in') {
        return [...baseItems, { label: 'Create Profile', game: '/create-profile' }];
      } else if (location.pathname === '/create-profile') {
        return [...baseItems, { label: 'Log In', game: '/log-in' }];
      } else {
        return [
          ...baseItems,
          { label: 'Create Profile', game: '/create-profile' },
          { label: 'Log In', game: '/log-in' }
        ];
      }
    }
  };

  const isProfileGroup = ['/profile', '/profile/settings', '/profile/friends'].includes(location.pathname);

  const menuItems = getMenuItems();

  const subNavItems = [
    { game: '/profile', label: 'Profile' },
    { game: '/profile/settings', label: 'Settings' },
    { game: '/profile/friends', label: 'Friends' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          navRef.current && 
          !navRef.current.contains(event.target) &&
          menuToggleRef.current &&
          !menuToggleRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  return (
    <>
      <header className="header">
        <div className="logo">
          <a href="https://www.facebook.com/CrowTours/"
          target="_blank" 
          description="Crow Tours Facebook Page" 
          rel="noopener noreferrer"
          >Crow Tours <span className="versionDisplay">V0.17</span></a>
        </div>
        <nav ref={navRef} className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {menuItems.map((item, index) => (
              <li key={item.label} className={isMenuOpen ? 'open' : ''} style={{transitionDelay: `${index * 0.1}s`}}>
                <Link 
                  to={item.game}
                  onClick={(e) => {
                    if (item.label === 'Log Out') {
                      handleLogout(e);
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div 
          ref={menuToggleRef}
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </div>
      </header>
    </>
  );
}

export default Header;