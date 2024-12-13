import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import ChallengeCard from '../ChallengeCard/ChallengeCard';
import { isValidGame } from '../../services/gameCreatorService';
import { useMessage } from '../../../../utils/MessageProvider';
import '../../../../css/GameCreator.scss';

const GameForm = ({
  gameData,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useMessage();
  const [formData, setFormData] = useState({
    ...gameData,
    name: gameData.name || '',
    description: gameData.description || '',
    public: gameData.public || false,
    game_id: gameData.game_id || '',
    challenges: gameData.challenges || []
  });
  const [originalData, setOriginalData] = useState({
    ...gameData,
    name: gameData.name || '',
    description: gameData.description || '',
    public: gameData.public || false,
    game_id: gameData.game_id || '',
    challenges: gameData.challenges || []
  });
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    console.log('GameForm received gameData:', gameData);
    setFormData({
      ...gameData,
      name: gameData.name || '',
      description: gameData.description || '',
      public: gameData.public || false,
      game_id: gameData.game_id || '',
      challenges: gameData.challenges || []
    });
    console.log('GameForm updated formData with game_id:', gameData.game_id);
  }, [gameData]);

  useEffect(() => {
    const isValid = isValidGame(formData);
    setAllRequiredFieldsFilled(isValid);
  }, [formData]);

  useEffect(() => {
    const hasDataChanges = Object.keys(formData).some(key => {
      return JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]);
    });
    setHasChanges(hasDataChanges);
  }, [formData, originalData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePublicToggle = (e) => {
    const isChecked = e.target ? e.target.checked : e;
    setFormData(prev => ({
      ...prev,
      public: isChecked
    }));
  };

  const handleChallengesClick = () => {
    if (formData?.game_id) {
      navigate(`/create/edit/${formData.game_id}/challenges`);
    } else if (gameData?.game_id) {
      navigate(`/create/edit/${gameData.game_id}/challenges`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('GameForm submitting with formData:', formData);
    try {
      await onSave({
        ...formData,
        challenges: formData.challenges || []
      });
      showSuccess(isEditing ? 'Game updated successfully!' : 'Game created successfully!');
    } catch (error) {
      showError(error.message || 'Failed to save game. Please try again.');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        navigate('/create');
      }
    } else {
      navigate('/create');
    }
  };

  return (
    <>
      <button onClick={handleBack} className="back-button" title="Back to Games">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="game-form">

        <div className="form-header">
          <h2>{isEditing ? 'Edit Game' : 'Create New Game'}</h2>
        </div>

        <div className="form-content">
          <div className="main-form">
            <div className="field-container">
              <label htmlFor="name">Game Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter game name"
                required
              />
            </div>

            <div className="field-container">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter game description"
                required
              />
            </div>

            <div className="field-container">
              <label>Game Visibility:</label>
              <ToggleSwitch
                checked={formData.public}
                onToggle={handlePublicToggle}
                label={formData.public ? 'Public Game' : 'Private Game'}
                name="public"
                id="public-toggle"
              />
            </div>

            {formData.game_id && (
              <div className="field-container">
                <label>Game ID:</label>
                <span className="game-id-display">{formData.game_id}</span>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="side-options">
              <ChallengeCard
                challengeCount={formData.challenges?.length || 0}
                onClick={handleChallengesClick}
              />
            </div>
          )}
        </div>

        <div className={`button-group ${hasChanges ? 'visible' : ''}`}>
          <button
            onClick={handleSubmit}
            disabled={!allRequiredFieldsFilled}
            className={`save-button ${!allRequiredFieldsFilled ? 'disabled' : ''}`}
          >
            {isEditing ? 'Update Game' : 'Create Game'}
          </button>
          {hasChanges && (
            <button onClick={onCancel} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GameForm;
