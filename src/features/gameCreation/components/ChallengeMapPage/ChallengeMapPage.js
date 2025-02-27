import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChallengeMap from '../../../../components/ChallengeMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../../../css/ChallengeMapPage.scss';

const ChallengeMapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenges = location.state?.challenges || [];
  const gameId = location.state?.gameId;

  // Filter challenges that have location data
  const challengesWithLocation = challenges.filter(
    challenge => challenge.targetLocation?.latitude && challenge.targetLocation?.longitude
  ).map(challenge => ({
    id: challenge.id,
    title: challenge.title,
    location: {
      lat: challenge.targetLocation.latitude,
      lng: challenge.targetLocation.longitude
    }
  }));

  const handleBack = () => {
    navigate(-1);
  };

  // Don't render map until we have a gameId
  if (!gameId) {
    return (
      <div className="challenge-map-page">
        <div className="challenge-map-header">
          <button className="back-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Challenge Locations</h2>
        </div>
        <div className="challenge-map--loading">
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="challenge-map-page">
      <div className="challenge-map-header">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2>Challenge Locations</h2>
      </div>
      <ChallengeMap 
        challenges={challengesWithLocation} 
        game={{ gameId }}
      />
    </div>
  );
};

export default ChallengeMapPage;
