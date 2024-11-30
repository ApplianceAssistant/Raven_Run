import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import '../css/App.scss';

function Header({ isMenuOpen, setIsMenuOpen }) {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

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
        //{ label: 'Create', game: '/create' },
        //{ label: 'Settings', game: '/settings' },
        //{ label: 'Friends', game: '/friends' },
        { label: 'Profile', game: '/profile' },
        { label: 'Log Out', game: '/logout' }  // We'll handle this specially
      ];
    } else {
      const baseItems = [
        { label: 'Home', game: '/' },
        { label: 'About', game: '/about' },
        { label: 'Contact', game: '/contact' },
        { label: 'Settings', game: '/settings' },
      ];
      if (location.gamename === '/log-in') {
        return [...baseItems, { label: 'Create Profile', game: '/create-profile' }];
      } else if (location.gamename === '/create-profile') {
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

  const isProfileGroup = ['/profile', '/settings', '/friends'].includes(location.gamename);

  const menuItems = getMenuItems();

  const subNavItems = [
    { game: '/profile', label: 'Profile' },
    { game: '/settings', label: 'Settings' },
    { game: '/friends', label: 'Friends' }
  ];

  return (
    <>
      <header className="header">
        <div className="logo">
          <a href="https://www.facebook.com/CrowTours/"
          target="_blank" 
          description="Crow Tours Facebook Page" 
          rel="noopener noreferrer"
          >Crow Tours <span className="versionDisplay">V0.9</span></a>
        </div>
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
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
        <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </div>
      </header>
    </>
  );
}

export default Header;