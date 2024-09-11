import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown, faArrowsV } from '@fortawesome/free-solid-svg-icons';
import { handleScroll, addLocationListener, removeLocationListener, getCurrentLocation, updateUserLocation } from '../utils/utils';

const GameCreator = () => {
  const [game, setGame] = useState({ id: 0, name: '', description: '', challenges: [] });
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleCreateGame = () => {
    if (game.name.trim() === '') {
      alert('Please enter a game title');
      return;
    }
    setGame({ ...game, id: Date.now() });
  };

  const handleAddChallenge = () => {
    setShowChallengeCreator(true);
    setCurrentChallenge(null);
  };

  const handleEditChallenge = (challenge) => {
    setCurrentChallenge(challenge);
    setShowChallengeCreator(true);
  };

  const handleSaveChallenge = (challenge) => {
    if (currentChallenge) {
      setGame({
        ...game,
        challenges: game.challenges.map(c => c.id === challenge.id ? challenge : c)
      });
    } else {
      setGame({
        ...game,
        challenges: [...game.challenges, { ...challenge, id: Date.now().toString() }]
      });
    }
    setShowChallengeCreator(false);
  };

  const handleDeleteChallenge = (challengeId) => {
    setGame({
      ...game,
      challenges: game.challenges.filter(c => c.id !== challengeId)
    });
    setShowChallengeCreator(false);
  };

  const toggleLocationDisplay = () => {
    setShowLocation(!showLocation);
    if (!showLocation) {
      updateUserLocation(); // Refresh location when showing
    }
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Create Your Own Path</h1>
          <div className="bodyContent center">
            {!game.id ? (
              <form onSubmit={(e) => { e.preventDefault(); handleCreateGame(); }}>
                <div className="account-field">
                  <label htmlFor="gameName">Game Title:</label>
                  <input
                    type="text"
                    id="gameName"
                    value={game.name}
                    onChange={(e) => setGame({ ...game, name: e.target.value })}
                    required
                  />
                </div>
                <div className="account-field">
                  <label htmlFor="gameDescription">Game Description:</label>
                  <textarea
                    id="gameDescription"
                    value={game.description}
                    onChange={(e) => setGame({ ...game, description: e.target.value })}
                  />
                </div>
                <button type="submit">Create Game</button>
              </form>
            ) : (
              <div className="game-editor">
                <h2>{game.name}</h2>
                <p>{game.description}</p>
                <div className="challenge-list">
                  {game.challenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-item" onClick={() => handleEditChallenge(challenge)}>
                      {challenge.title || challenge.type}
                    </div>
                  ))}
                </div>
                <div className="button-container-bottom">
                  <button onClick={handleAddChallenge}>Add Challenge</button>
                  <button onClick={() => setGame({ ...game, id: 0 })}>Edit Game Info</button>
                  <button onClick={toggleLocationDisplay}>
                    {showLocation ? 'Hide Location' : 'Show Location'}
                  </button>
                </div>
                {showLocation && userLocation && (
                  <div className="location-display">
                    <p>Current Location:</p>
                    <p>Latitude: {userLocation.latitude.toFixed(6)}</p>
                    <p>Longitude: {userLocation.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>
            )}
            {showChallengeCreator && (
              <ChallengeCreator
                challenge={currentChallenge}
                onSave={handleSaveChallenge}
                onDelete={handleDeleteChallenge}
                onBack={() => setShowChallengeCreator(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeCreator = ({ challenge, onSave, onDelete, onBack }) => {
  const [challengeData, setChallengeData] = useState(challenge || { type: '', title: '' });

  const handleSave = () => {
    onSave(challengeData);
  };

  const handleDelete = () => {
    if (challenge) {
      onDelete(challenge.id);
    } else {
      onBack();
    }
  };

  return (
    <div className="challenge-creator">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="account-field">
          <label htmlFor="challengeType">Challenge Type:</label>
          <select
            id="challengeType"
            value={challengeData.type}
            onChange={(e) => setChallengeData({ ...challengeData, type: e.target.value })}
            required
          >
            <option value="">Select challenge type</option>
            <option value="story">Story</option>
            <option value="multipleChoice">Multiple Choice</option>
            <option value="trueFalse">True/False</option>
            <option value="textInput">Text Input</option>
            <option value="travel">Travel</option>
            <option value="areaSearch">Area Search</option>
          </select>
        </div>

        {challengeData.type && (
          <div className="account-field">
            <label htmlFor="challengeTitle">Challenge Title:</label>
            <input
              type="text"
              id="challengeTitle"
              value={challengeData.title}
              onChange={(e) => setChallengeData({ ...challengeData, title: e.target.value })}
              required
            />
          </div>
        )}

        <div className="button-container">
          <button type="submit">Save</button>
          <button type="button" onClick={handleDelete}>Delete</button>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default GameCreator;