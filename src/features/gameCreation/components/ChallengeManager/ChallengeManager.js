import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useGameCreation } from '../../context/GameCreationContext';
import ScrollableContent from '../../../../components/ScrollableContent';
import '../../../../css/GameCreator.scss';

const ChallengeManager = () => {
  const navigate = useNavigate();
  const { state } = useGameCreation();
  const game = state.selectedGame;
  const challenges = Array.isArray(game?.challenges) ? [...game.challenges].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  const handleBack = () => {
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleAddChallenge = () => {
    navigate(`/create/challenge/${game.gameId}`);
  };

  const handleEditChallenge = (challenge) => {
    navigate(`/create/challenge/${game.gameId}/${challenge.id}`);
  };

  return (
    <>
      <button className="back-button" onClick={handleBack} title="Back to Game">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="challenge-manager">
        <div className="challenge-manager-header">
          <h2>Challenges for {game?.title || 'Game'}</h2>
        </div>
        <button className="add-challenge-button" onClick={handleAddChallenge}>
          Add New Challenge
        </button>
        <ScrollableContent maxHeight="70vh">
        <div className="challenges-list">
          {challenges.length > 0 ? (
            challenges.map((challenge, index) => (
              <div key={challenge.id} className="challenge-item" onClick={() => handleEditChallenge(challenge)}>
                <div className="challenge-header">
                  <span className="challenge-type">{challenge.type}</span>
                  <span className="challenge-order">#{challenge.order || index + 1}</span>
                </div>
                <h3>{challenge.title}</h3>
                <div className="challenge-preview">
                  {challenge.description && (
                    <p className="challenge-description">{challenge.description.substring(0, 100)}...</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-challenges">
              <p>No challenges yet. Click the button below to add your first challenge!</p>
            </div>
          )}
        </div>
        </ScrollableContent>
      </div>
    </>
  );
};

export default ChallengeManager;
