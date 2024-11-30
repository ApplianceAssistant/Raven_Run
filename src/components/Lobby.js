import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableContent from './ScrollableContent';
import { faLongArrowUp, faLongArrowDown, faArrowsV, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { games } from '../data/challenges';
import { getGamesFromLocalStorage } from '../utils/localStorageUtils';
import { isHuntInProgress, getHuntProgress, clearHuntProgress } from '../utils/huntProgressUtils';
import Modal from './Modal';

function Lobby() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customGames, setCustomGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedGames = getGamesFromLocalStorage();
    setCustomGames(storedGames);
  }, []);

  const handleGameSelect = (gameId) => {
    if (isHuntInProgress()) {
      setSelectedGameId(gameId);
      setIsModalOpen(true);
    } else {
      startNewHunt(gameId);
    }
  };

  const startNewHunt = (gameId) => {
    const selectedGame = [...games, ...customGames].find(p => p.id === gameId);
    if (selectedGame && selectedGame.description) {
      navigate(`/hunt-description/${gameId}`);
    } else {
      navigate(`/game/${gameId}/challenge/0`);
    }
  };

  const continueCurrentHunt = () => {
    const progress = getHuntProgress();
    if (progress) {
      navigate(`/game/${progress.gameId}/challenge/${progress.challengeIndex}`);
    }
  };

  const abandonCurrentHunt = () => {
    clearHuntProgress();
    startNewHunt(selectedGameId);
  };

  useEffect(() => {
    // Fetch custom games from local storage
    const storedGames = getGamesFromLocalStorage();
    setCustomGames(storedGames);
  }, []);

  const isDaytime = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 18; // Assuming daytime is from 6 AM to 6 PM
  };

  const isCloseToNight = () => {
    const hour = currentTime.getHours();
    return hour >= 17; // Disable day-only games after 5 PM
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderGameList = (gameList, title) => (
    <>
      <h3>{title}</h3>
      <ul className="game-list">
        {gameList.map((game) => (
          <li key={game.id} className={`game-item ${game.dayOnly && isCloseToNight() ? 'disabled' : ''}`}>
            <button
              onClick={() => handleGameSelect(game.id)}
              disabled={game.dayOnly && isCloseToNight()}
            >
              {game.name}
              {game.dayOnly && (
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
    <>
        <h2 className="contentHeader">Select your Hunt<br /></h2>
        <p>(More Coming soon)</p>
        <ScrollableContent maxHeight="60vh">
          <div className="default-games-section">
            {renderGameList(games, "")}
          </div>
        </ScrollableContent>
        {isHuntInProgress() && (
          <div className="center">
            <button onClick={continueCurrentHunt}>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hunt in Progress"
        content="You have a hunt in progress. What would you like to do?"
        buttons={[
          { label: 'Continue', onClick: continueCurrentHunt },
          { label: 'Abandon', onClick: abandonCurrentHunt },
          { label: 'Cancel', onClick: () => setIsModalOpen(false) }
        ]}
        showTextToSpeech={false}
      />
    </>
  );
}

export default Lobby;