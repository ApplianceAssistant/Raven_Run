import React from 'react';
import { useGameCreation } from '../../context/GameCreationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import '../../../../css/GameCreator.scss';
import ScrollableContent from '../../../../components/ScrollableContent';

const GameList = ({ onGameSelect, onDeleteGame }) => {
  const { state } = useGameCreation();
  const { games = [], isLoading = false } = state || {};

  if (isLoading) {
    return <div>Loading games...</div>;
  }
  console.log("games", games);

  return (
    <div className="game-list">
      {games.length === 0 ? (
        <p>No games yet. <br></br>Create your first game!</p>
      ) : (
        <>
        <h2>Your Games</h2>
        <ScrollableContent maxHeight="60vh" className="games-container">
            {games.map((game) => (
              <div
                key={game.gameId}
                className="game-item"
                onClick={() => onGameSelect(game)}
              >
                <div className="game-content">
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <p className="game-id">Game ID: {game.gameId}</p>
                </div>
                <button
                  className="btn-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGame(game);
                  }}
                  aria-label="Delete game"
                >
                  <FontAwesomeIcon icon={faBan} />
                </button>
              </div>
            ))}
          </ScrollableContent>
          </>
      )}
    </div>
  );
};

export default GameList;
