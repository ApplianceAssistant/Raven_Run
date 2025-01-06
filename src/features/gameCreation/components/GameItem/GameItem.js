import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import './GameItem.scss';

const GameItem = ({ game, onSelect, onDelete }) => {
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="game-item" onClick={() => onSelect(game)}>
      <div className="game-content">
        <h3>{game.title}</h3>
        <p className="description">{truncateDescription(game.description)}</p>
        <p className="game-id">Game ID: {game.gameId}</p>
      </div>
      <button
        className="btn-remove"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(game);
        }}
        aria-label="Delete game"
      >
        <FontAwesomeIcon icon={faBan} />
      </button>
    </div>
  );
};

export default GameItem;
