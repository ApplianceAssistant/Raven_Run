import React from 'react';

const PathStructure = ({ game, onChallengeClick }) => {
  return (
    <div className="path-structure">
      <h1 className="contentHeader">{game.name}</h1>
      <p>{game.description}</p>
      <h2>Challenges:</h2>
      <ul>
        {game.challenges.map((challenge, index) => (
          <li key={challenge.id} onClick={() => onChallengeClick(challenge.id)}>
            <h3>{index + 1}. {challenge.title}</h3>
            <p>Type: {challenge.type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PathStructure;