import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useGameCreation } from '../../context/GameCreationContext';
import ScrollableContent from '../../../../components/ScrollableContent';
import { saveGame } from '../../services/gameCreatorService';
import { useMessage } from '../../../../utils/MessageProvider';
import Modal from '../../../../components/Modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../../../../css/GameCreator.scss';

const SortableItem = ({ challenge, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: challenge.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`challenge-item ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => onEdit(challenge)}
      {...attributes}
    >
      <div className="challenge-header">
        <div className="drag-handle" {...listeners}>
          <FontAwesomeIcon icon={faGripVertical} />
        </div>
        <button
          className="btn-remove"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(challenge);
          }}
          title="Delete challenge"
        >
          <FontAwesomeIcon icon={faBan} />
        </button>
        <span className="challenge-type">{challenge.type}</span>
        <span className="challenge-order">#{challenge.order}</span>
      </div>
      <h3>{challenge.title}</h3>
      <div className="challenge-preview">
        {challenge.description && (
          <p className="challenge-description">{challenge.description.substring(0, 100)}...</p>
        )}
      </div>
    </div>
  );
};

const ChallengeManager = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGameCreation();
  const { showError, showSuccess, showMessage } = useMessage();
  const game = state.selectedGame;
  const challenges = Array.isArray(game?.challenges) ? [...game.challenges].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const [challengeToDelete, setChallengeToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  console.warn('game:', game);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleBack = () => {
    navigate(`/create/edit/${game.gameId}`);
  };

  const handleAddChallenge = () => {
    navigate(`/create/challenge/${game.gameId}`);
  };

  const handleEditChallenge = (challenge) => {
    navigate(`/create/challenge/${game.gameId}/${challenge.id}`);
  };

  const handleDeleteClick = (challenge) => {
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = challenges.findIndex(item => item.id === active.id);
    const newIndex = challenges.findIndex(item => item.id === over.id);

    const updatedChallenges = arrayMove(challenges, oldIndex, newIndex);

    // Update order numbers
    updatedChallenges.forEach((challenge, index) => {
      challenge.order = index + 1;
    });

    const updatedGame = {
      ...game,
      challenges: updatedChallenges
    };

    try {
      await saveGame(updatedGame);
      dispatch({ type: 'SET_GAMES', payload: state.games.map(g => g.gameId === game.gameId ? updatedGame : g) });
      dispatch({ type: 'SELECT_GAME', payload: updatedGame });
      showSuccess('Challenge order updated successfully');
    } catch (error) {
      console.error('Error updating challenge order:', error);
      showError('Failed to update challenge order. Please try again.');
    }
  };

  const hasLocationChallenges = game?.challenges?.some(challenge => challenge.targetLocation?.latitude && challenge.targetLocation?.longitude);

  const handleMapClick = () => {
    if (!hasLocationChallenges) {
      showMessage('Create at least 1 travel challenge with a location to unlock mapping.');
      return;
    }
    navigate('/challenge-map', { state: { challenges: game.challenges } });
  };

  return (
    <>
      <button className="back-button" onClick={handleBack} title="Back to Game">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="challenge-manager">
        <div className="challenge-manager-header">
          <h2>Challenges for {game?.title || 'Game'}</h2>
          <div className="challenge-manager-actions">
            <button className="add-challenge-button" onClick={handleAddChallenge}>
              Add New
            </button>
            <button 
              className={`map-challenges-button ${!hasLocationChallenges ? 'disabled' : ''}`}
              onClick={handleMapClick}
            >
              Map
            </button>
          </div>
        </div>

        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 70)">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={challenges.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="challenges-list">
                {challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <SortableItem
                      key={challenge.id}
                      challenge={challenge}
                      onEdit={handleEditChallenge}
                      onDelete={handleDeleteClick}
                    />
                  ))
                ) : (
                  <div className="no-challenges">
                    <p>No challenges yet. Click the button above to add your first challenge!</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
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
