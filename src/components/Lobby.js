import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableContent from './ScrollableContent';
import { faLongArrowUp, faLongArrowDown, faArrowsV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { paths } from '../data/challenges';

function Lobby() {  

  const navigate = useNavigate();

  const handlePathSelect = (pathName) => {
    navigate(`/path/${pathName}`);
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const isDaytime = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 18; // Assuming daytime is from 6 AM to 6 PM
  };

  const isCloseToNight = () => {
    const hour = currentTime.getHours();
    return hour >= 17; // Disable day-only paths after 5 PM
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h2 className="contentHeader">Select your path</h2>
            <ScrollableContent maxHeight="400px">
              <ul className="path-list">
                {paths.map((path) => (
                  <li key={path.id} className={`path-item ${path.dayOnly && isCloseToNight() ? 'disabled' : ''}`}>
                    <button
                      onClick={() => handlePathSelect(path.id)}
                      disabled={path.dayOnly && isCloseToNight()}
                    >
                      {path.name}
                      {path.dayOnly && (
                        <span className="day-only-indicator">
                          <FontAwesomeIcon icon={faSun} /> Day Only
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollableContent>
            <p className="time-indicator">
              Time: {formatTime(currentTime)}
              <span className="day-night-indicator">
                <FontAwesomeIcon icon={isDaytime() ? faSun : faMoon} />
                {isDaytime() ? ' Day' : ' Night'}
              </span>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Lobby;