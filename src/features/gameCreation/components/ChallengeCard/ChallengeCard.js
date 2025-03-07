import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDragon } from '@fortawesome/free-solid-svg-icons';
import '../../../../css/GameCreator.scss';

const ChallengeCard = ({ challengeCount, onClick }) => {
  return (
    <div className="game-item challenge-card" onClick={onClick} title="Manage Game Challenges">
      <div className="challenge-content">
        <FontAwesomeIcon icon={faDragon} className="challenge-icon" />
        <span className="challenge-title">Challenges</span>
        <div className="challenge-info">
          <span className="challenge-count">{challengeCount}</span>
          <span className="challenge-label">Challenges</span>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
