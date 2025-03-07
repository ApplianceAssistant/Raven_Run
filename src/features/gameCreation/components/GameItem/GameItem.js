import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import '../../../../css/GameCreator.scss';

const GameItem = ({ game, onSelect, onDelete }) => {
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="game-item" onClick={() => onSelect(game)}>
      <div className="game-content">
        <h3>{game.title || 'Untitled Game'}</h3>
        <p className="description">{truncateDescription(game.description)}</p>
        <p className="game-id">Game ID: {game.gameId}</p>
        <p className="game-visibility">
          <span className={`visibility-badge ${game.isPublic ? 'public' : 'private'}`}>
            {game.isPublic ? 'Public' : 'Private'}
          </span>
        </p>
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
