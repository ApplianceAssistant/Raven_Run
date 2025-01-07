import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import AutoExpandingTextArea from '../../../../components/AutoExpandingTextArea/AutoExpandingTextArea';
import ChallengeCard from '../ChallengeCard/ChallengeCard';
import ScrollableContent from '../../../../components/ScrollableContent';
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
    title: '',
    description: '',
    isPublic: false,
    gameId: '',
    challenges: []
  });
  const [originalData, setOriginalData] = useState({
    title: '',
    description: '',
    isPublic: false,
    gameId: '',
    challenges: []
  });
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Initialize both formData and originalData when gameData changes
  useEffect(() => {
    const initialData = {
      ...gameData,
      title: gameData.title || '',
      description: gameData.description || '',
      isPublic: gameData.isPublic || false,
      gameId: gameData.gameId || '',
      challenges: gameData.challenges || []
    };
    setFormData(initialData);
    setOriginalData(JSON.parse(JSON.stringify(initialData)));
  }, [gameData]);

  useEffect(() => {
    const isValid = isValidGame(formData);
    setAllRequiredFieldsFilled(isValid);
  }, [formData]);

  useEffect(() => {
    const hasDataChanges = Object.keys(formData).some(key => {
      const isDifferent = JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]);
      return isDifferent;
    });
    setHasChanges(hasDataChanges);
  }, [formData, originalData]);

  // Handle button animation
  useEffect(() => {
    if (hasChanges) {
      setShowButtons(true);
      setIsAnimatingOut(false);
    } else if (showButtons) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShowButtons(false);
        setIsAnimatingOut(false);
      }, 300); // Match the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

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
      isPublic: isChecked
    }));
  };

  const handleChallengesClick = () => {
    if (formData?.gameId) {
      navigate(`/create/edit/${formData.gameId}/challenges`);
    } else if (gameData?.gameId) {
      navigate(`/create/edit/${gameData.gameId}/challenges`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidGame(formData)) {
      console.warn("save game: ", formData);
      try {
        const submittedData = {
          ...formData,
          challenges: formData.challenges || []
        };
        await onSave(submittedData);
        const newOriginalData = JSON.parse(JSON.stringify(submittedData));
        setOriginalData(newOriginalData);
        setHasChanges(false);
        showSuccess(isEditing ? 'Game updated successfully!' : 'Game created successfully!');
      } catch (error) {
        showError(error.message || 'Failed to save game. Please try again.');
      }
    } else {
      showError('Please fill in all required fields.');
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
    <div className="creator-form">
      <button onClick={handleBack} className="back-button" title="Back to Games">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="creator-header">
        <h2>{isEditing ? 'Edit Game' : 'Create New Game'}</h2>
        <div className={`button-group ${hasChanges ? 'visible' : ''} ${isAnimatingOut ? 'animating-out' : ''}`}>
          {(showButtons || isAnimatingOut) && (
            <>
              <button
                onClick={handleSubmit}
                disabled={!allRequiredFieldsFilled}
                className={`save-button ${!allRequiredFieldsFilled ? 'disabled' : ''}`}
              >
                {isEditing ? 'Update Game' : 'Create Game'}
              </button>
              <button onClick={onCancel} className="cancel-button">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <ScrollableContent maxHeight="calc(100vh - 180px)" className="form-content">
        <div className="main-form">
          <div className="field-container">
            <label htmlFor="title">Game Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter game name"
              required
            />
          </div>

          <div className="field-container">
            <label htmlFor="description">Description:</label>
            <AutoExpandingTextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter game description"
              required
              maxHeight="50vh"
              minHeight="60px"
            />
          </div>

          <div className="field-container">
            <label>Game Visibility:</label>
            <ToggleSwitch
              checked={formData.isPublic}
              onToggle={handlePublicToggle}
              label={formData.isPublic ? 'Public Game' : 'Private Game'}
              name="isPublic"
              id="public-toggle"
            />
          </div>

          {formData.gameId && (
            <div className="field-container">
              <label>Game ID:</label>
              <span className="game-id-display">{formData.gameId}</span>
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
      </ScrollableContent>
    </div>
  );
};

export default GameForm;
