import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan } from '@fortawesome/free-solid-svg-icons';
import { useGameCreation } from '../../context/GameCreationContext';
import ScrollableContent from '../../../../components/ScrollableContent';
import { saveGame } from '../../services/gameCreatorService';
import { useMessage } from '../../../../utils/MessageProvider';
import Modal from '../../../../components/Modal';
import '../../../../css/GameCreator.scss';

const ChallengeManager = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameCreation();
  const { showError, showSuccess } = useMessage();
  const game = state.selectedGame;
  const challenges = Array.isArray(game?.challenges) ? [...game.challenges].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleBack = () => {
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleAddChallenge = () => {
    navigate(`/create/challenge/${game.gameId}`);
  };

  const handleEditChallenge = (challenge) => {
    navigate(`/create/challenge/${game.gameId}/${challenge.id}`);
  };

  const handleDeleteClick = (e, challenge) => {
    e.stopPropagation(); // Prevent triggering the edit click
    setChallengeToDelete(challenge);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const updatedGame = {
        ...game,
        challenges: game.challenges.filter(c => c.id !== challengeToDelete.id)
      };

      await saveGame(updatedGame);
      dispatch({ type: 'SET_GAMES', payload: state.games.map(g => g.gameId === game.gameId ? updatedGame : g) });
      dispatch({ type: 'SELECT_GAME', payload: updatedGame });
      showSuccess('Challenge deleted successfully');
      setIsDeleteModalOpen(false);
      setChallengeToDelete(null);
    } catch (error) {
      console.error('Error deleting challenge:', error);
      showError('Failed to delete challenge. Please try again.');
    }
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
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 70)">
          <div className="challenges-list">
            {challenges.length > 0 ? (
              challenges.map((challenge, index) => (
                <div key={challenge.id} className="challenge-item" onClick={() => handleEditChallenge(challenge)}>
                  <div className="challenge-header">
                    <button
                      className="btn-remove"
                      onClick={(e) => handleDeleteClick(e, challenge)}
                      title="Delete challenge"
                    >
                      <FontAwesomeIcon icon={faBan} />
                    </button>
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChallengeToDelete(null);
        }}
        title="Delete Challenge"
        content={
          <>
            <p>Are you sure you want to delete this challenge?</p>
            <p>Title: {challengeToDelete?.title}</p>
            <p>This action cannot be undone.</p>
          </>
        }
        buttons={[
          {
            label: 'Yes, Delete',
            onClick: handleDeleteConfirm,
            className: 'danger'
          },
          {
            label: 'Cancel',
            onClick: () => {
              setIsDeleteModalOpen(false);
              setChallengeToDelete(null);
            },
            className: 'secondary'
          }
        ]}
      />
    </>
  );
};

export default ChallengeManager;
