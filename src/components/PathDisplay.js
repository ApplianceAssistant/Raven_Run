import React from 'react';
import '../css/PathDisplay.scss';

const PathDisplay = ({ game, onCreateNewChallenge, onEditChallenge }) => {
  return (
    <div className="path-display">
      <h2>{game.name || 'Untitled Path'}</h2>
      <p>{game.description || 'No description provided.'}</p>
      
      <h3>Challenges:</h3>
      {game.challenges.length === 0 ? (
        <p>No challenges created yet.</p>
      ) : (
        <ul className="challenge-list">
          {game.challenges.map((challenge, index) => (
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

export default PathDisplay;