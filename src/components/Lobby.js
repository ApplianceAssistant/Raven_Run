import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function Lobby() {
  const [paths, setPaths] = useState([
    { name: "Down Town", dayOnly: false },
    { name: "The Woods", dayOnly: true },
    { name: "Mall", dayOnly: false }
  ]);

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
      <div className="oval-content">
        <div className="content">
          <h1 className="contentHeader">Lobby</h1>
          <div className="bodyContent">
            <p>Select your path</p>
            <ul className="path-list">
              {paths.map((path, index) => (
                <li key={index} className={`path-item ${path.dayOnly && isCloseToNight() ? 'disabled' : ''}`}>
                  <button disabled={path.dayOnly && isCloseToNight()}>
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
            <p className="time-indicator">
              Current time: {formatTime(currentTime)}
              <span className="day-night-indicator">
                <FontAwesomeIcon icon={isDaytime() ? faSun : faMoon} />
                {isDaytime() ? ' Day' : ' Night'}
              </span>
            </p>
          </div>
          <div className="scroll-indicator">
            <FontAwesomeIcon icon={faLongArrowUp} className="arrow up" />
            <FontAwesomeIcon icon={faArrowsV} className="arrow updown" />
            <FontAwesomeIcon icon={faLongArrowDown} className="arrow down" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;