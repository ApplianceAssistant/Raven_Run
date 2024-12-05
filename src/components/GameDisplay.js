import React from 'react';
import '../css/GameDisplay.scss';

const GameDisplay = ({ game, onCreateNewChallenge, onEditChallenge }) => {
  // Create a safe reference to challenges, defaulting to empty array if not valid
  const challenges = Array.isArray(game?.challenges) ? game.challenges : [];
  
  return (
    <div className="game-display">
      <h2>{game?.name || 'Untitled Game'}</h2>
      <p>{game?.description || 'No description provided.'}</p>
      
      <h3>Challenges:</h3>
      {challenges.length === 0 ? (
        <p>No challenges created yet.</p>
      ) : (
        <ul className="challenge-list">
          {challenges.map((challenge, index) => (
            <li 
              key={challenge.id} 
              className="challenge-item"
              onClick={() => onEditChallenge(challenge)}
            >
              <span className="challenge-number">{index + 1}.</span>
              <span className="challenge-title">{challenge.title || 'Untitled Challenge'}</span>
              <span className="challenge-type">({challenge.type})</span>
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={onCreateNewChallenge} className="create-challenge-button">
        Create New Challenge
      </button>
    </div>
  );
};

export default GameDisplay;