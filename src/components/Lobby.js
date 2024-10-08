import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableContent from './ScrollableContent';
import { faLongArrowUp, faLongArrowDown, faArrowsV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { paths } from '../data/challenges';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import { isHuntInProgress, getHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils';
import Modal from './Modal';

function Lobby() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customPaths, setCustomPaths] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedPaths = getGamesFromLocalStorage();
    setCustomPaths(storedPaths);
  }, []);

  const handlePathSelect = (pathId) => {
    if (isHuntInProgress()) {
      setSelectedPathId(pathId);
      setIsModalOpen(true);
    } else {
      startNewHunt(pathId);
    }
  };

  const startNewHunt = (pathId) => {
    const selectedPath = [...paths, ...customPaths].find(p => p.id === pathId);
    if (selectedPath && selectedPath.description) {
      navigate(`/hunt-description/${pathId}`);
    } else {
      navigate(`/path/${pathId}/challenge/0`);
    }
  };

  const continueCurrentHunt = () => {
    const progress = getHuntProgress();
    if (progress) {
      navigate(`/path/${progress.pathId}/challenge/${progress.challengeIndex}`);
    }
  };

  const abandonCurrentHunt = () => {
    clearHuntProgress();
    startNewHunt(selectedPathId);
  };

  useEffect(() => {
    // Fetch custom paths from local storage
    const storedPaths = getGamesFromLocalStorage();
    setCustomPaths(storedPaths);
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
        ))}
      </ul>
    </>
  );

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h2 className="contentHeader">Select your Hunt<br /><span style={{ fontSize: '.9em' }}>(more coming soon)</span></h2>
          <ScrollableContent maxHeight="60vh">
            <div className="default-paths-section">
              {renderPathList(paths, "")}
            </div>
          </ScrollableContent>
          {isHuntInProgress() && (
            <div className="center">
            <button onClick={continueCurrentHunt} className="return-to-hunt-button">
              Return to Hunt
            </button>
            </div>
          )}
          <p className="time-indicator">
            Time: {formatTime(currentTime)}
            <span className="day-night-indicator">
              <FontAwesomeIcon icon={isDaytime() ? faSun : faMoon} />
              {isDaytime() ? ' Day' : ' Night'}
            </span>
          </p>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hunt in Progress"
        content="You have a hunt in progress. What would you like to do?"
        buttons={[
          { label: 'Continue Hunt', onClick: continueCurrentHunt },
          { label: 'Abandon Hunt', onClick: abandonCurrentHunt },
          { label: 'Cancel', onClick: () => setIsModalOpen(false) }
        ]}
      />
    </div>
  );
}

export default Lobby;