import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../../../css/GameCreator.scss';

const ChallengeManager = ({ game, onSave }) => {
  const navigate = useNavigate();
  const challenges = Array.isArray(game?.challenges) ? game.challenges : [];

  const handleBack = () => {
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleAddChallenge = () => {
    navigate(`/create/challenge/${game.gameId}`);
  };

  return (
    <>
      <button className="back-button" onClick={handleBack} title="Back to Game">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="challenge-manager">
        <div className="challenge-manager-header">
          <h2>Challenges for {game?.name || 'Game'}</h2>
        </div>

        <div className="challenges-list">
          {challenges.length > 0 ? (
            challenges.map((challenge, index) => (
              <div key={index} className="challenge-item">
                <h3>Challenge {index + 1}</h3>
                {/* Challenge details will go here */}
              </div>
            ))
          ) : (
            <div className="no-challenges">
              <p>No challenges yet. Click the button below to add your first challenge!</p>
            </div>
          )}
        </div>

        <button className="add-challenge-button" onClick={handleAddChallenge}>
          Add New Challenge
        </button>
      </div>
    </>
  );
};

export default ChallengeManager;
