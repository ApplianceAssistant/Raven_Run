import React from 'react';
import { useGameCreation } from '../../context/GameCreationContext';
import '../../../../css/GameCreator.scss';

const GameList = ({ onGameSelect, onDeleteGame }) => {
  const { state } = useGameCreation();
  const { games = [], isLoading = false } = state || {};

  if (isLoading) {
    return <div>Loading games...</div>;
  }

  return (
    <div className="game-list">
      <h2>Your Games</h2>
      {games.length === 0 ? (
        <p>No games created yet. Create your first game!</p>
      ) : (
        <div className="games-container">
          {games.map((game) => (
            <div key={game.gameId} className="game-item">
              <div className="game-info" onClick={() => onGameSelect(game)}>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <p className="game-id">Game ID: {game.gameId}</p>
              </div>
              <button 
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGame(game);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;
