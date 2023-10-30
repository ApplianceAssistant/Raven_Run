import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function Header() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleOutsideClick = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 500);
    };

    window.addEventListener('resize', handleResize);
    setIsMobile(window.innerWidth < 500);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobile]);

  const renderMenuItems = () => {
    return routes.map((route) => (
      <li key={route.path}>
        <Link to={route.path}>{route.label}</Link>
      </li>
    ));
  };

  return (
    <header>
      <nav>
        {isMobile ? (
          <div className={`menu mobile-menu`}>
            <span className="menu-icon" onClick={handleSidebarToggle}>
              {showSidebar ? '✕' : '☰'}
            </span>
            {showSidebar && (
              <div className={`sidebar`} ref={sidebarRef}>
                <ul>{renderMenuItems()}</ul>
              </div>
            )}
          </div>
        ) : (
          <ul className={`desktop-menu`}>{renderMenuItems()}</ul>
        )}
      </nav>
    </header>
  );
}

export default Header;
