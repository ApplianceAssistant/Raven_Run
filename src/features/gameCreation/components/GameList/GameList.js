import React from 'react';
import { useGameCreation } from '../../context/GameCreationContext';
import ScrollableContent from '../../../../components/ScrollableContent';
import GameItem from '../GameItem/GameItem';
import '../../../../css/GameCreator.scss';

const GameList = ({ onGameSelect, onDeleteGame }) => {
  const { state } = useGameCreation();
  const { games = [], isLoading = false } = state || {};

  if (isLoading) {
    return <div>Loading games...</div>;
  }
  return (
    <div className="game-list">
      {games.length === 0 ? (
        <p>No games yet. <br></br>Create your first game!</p>
      ) : (
        <>
          <h2>Your Games</h2>
          <ScrollableContent dependencies={['game-list']} maxHeight="calc(var(--content-vh, 1vh) * 80)" className="games-container">
            {games.map((game) => (
              <GameItem
                key={game.gameId}
                game={game}
                onSelect={onGameSelect}
                onDelete={onDeleteGame}
              />
            ))}
          </ScrollableContent>
        </>
      )}
    </div>
  );
};

export default GameList;
