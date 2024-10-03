import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableContent from './ScrollableContent';
import { faLongArrowUp, faLongArrowDown, faArrowsV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { paths } from '../data/challenges';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';

function Lobby() {  
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customPaths, setCustomPaths] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch custom paths from local storage
    const storedPaths = getGamesFromLocalStorage();
    setCustomPaths(storedPaths);
  }, []);

  const handlePathSelect = (pathId) => {
    const selectedPath = [...paths, ...customPaths].find(p => p.id === pathId);
    if (selectedPath && selectedPath.description) {
      navigate(`/hunt-description/${pathId}`);
    } else {
      navigate(`/path/${pathId}/challenge/0`);
    }
  };

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

  const renderPathList = (pathList, title) => (
    <>
      <h3>{title}</h3>
      <ul className="path-list">
        {pathList.map((path) => (
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
          //add path description display
          
        ))}
      </ul>
    </>
  );

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h2 className="contentHeader">Select your Hunt<br></br><span style={{"font-size":'.9em'}}>(more coming soon)</span></h2>
          <ScrollableContent maxHeight="60vh">
            <div className="default-paths-section">
              {renderPathList(paths, "")}
            </div>
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