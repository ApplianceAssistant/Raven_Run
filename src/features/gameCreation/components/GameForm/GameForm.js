import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlay, faInfoCircle, faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import AutoExpandingTextArea from '../../../../components/AutoExpandingTextArea/AutoExpandingTextArea';
import ChallengeCard from '../ChallengeCard/ChallengeCard';
import ScrollableContent from '../../../../components/ScrollableContent';
import { isValidGame } from '../../services/gameCreatorService';
import { useMessage } from '../../../../utils/MessageProvider';
import { setPlaytestState } from '../../../../utils/localStorageUtils';
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
    challenges: [],
    difficulty_level: 'medium',
    tags: [],
    dayOnly: false
  });
  const [originalData, setOriginalData] = useState({
    title: '',
    description: '',
    isPublic: false,
    gameId: '',
    challenges: [],
    difficulty_level: 'medium',
    tags: [],
    dayOnly: false
  });
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Initialize both formData and originalData when gameData changes
  useEffect(() => {
    const initialData = {
      ...gameData,
      title: gameData.title || '',
      description: gameData.description || '',
      isPublic: gameData.isPublic || false,
      gameId: gameData.gameId || '',
      challenges: gameData.challenges || [],
      difficulty_level: gameData.difficulty || gameData.difficulty_level || 'medium',
      tags: gameData.tags || [],
      dayOnly: gameData.dayOnly || false
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
      // Skip comparison if values are undefined or null
      if (!formData[key] && !originalData[key]) return false;

      try {
        // Handle special cases for DOM events and complex objects
        if (typeof formData[key] === 'object' || typeof originalData[key] === 'object') {
          return JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]);
        }
        // Simple comparison for primitive values
        return formData[key] !== originalData[key];
      } catch (error) {
        console.warn('Comparison error for key:', key, error);
        // If JSON stringify fails, do a direct comparison
        return formData[key] !== originalData[key];
      }
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // Split the input by commas and filter out empty strings
      const tagsToAdd = newTag.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Add each tag if it's not already in the list
      const updatedTags = [...formData.tags];
      tagsToAdd.forEach(tag => {
        if (!updatedTags.includes(tag)) {
          updatedTags.push(tag);
        }
      });

      setFormData(prev => ({
        ...prev,
        tags: updatedTags
      }));
      setNewTag('');
    }
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTag(value);

    // If the last character is a comma, automatically add the tags
    if (value.endsWith(',')) {
      handleAddTag();
    }
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePublicToggle = (e) => {
    const isChecked = e.target ? e.target.checked : e;
    setFormData(prev => ({
      ...prev,
      isPublic: isChecked
    }));
  };

  const handleDayOnlyToggle = (isChecked) => {
    setFormData(prev => ({
      ...prev,
      dayOnly: isChecked
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

  const handlePlaytest = () => {
    console.warn("handle play test called")
    if (formData?.gameId) {
      console.log("Navigating to playtest")
      setPlaytestState(formData.gameId);
      navigate(`/gamedescription/${formData.gameId}`);
    }
  };

  const handleCancel = () => {
    // Reset form data to original state
    setFormData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  return (
    <div className="creator-form">
      <button onClick={handleBack} className="back-button" title="Back to Games">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="creator-header">
        <h2>{isEditing ? 'Edit Game' : 'Create New Game'}</h2>
        {isEditing && (
          <button
            className="playtest-button"
            onClick={handlePlaytest}
            title="Playtest Game"
          >
            <FontAwesomeIcon icon={faPlay} /> Playtest
          </button>
        )}
      </div>
      
      <div>
        {formData.gameId && (
          <span className="game-id-display"> <span className="label">Game ID: </span>{formData.gameId}</span>
        )}
      </div>
      <div className={`button-group ${hasChanges ? 'visible' : ''} ${isAnimatingOut ? 'animating-out' : ''}`}>
        {(showButtons || isAnimatingOut) && (
          <>
            <button
              onClick={handleSubmit}
              disabled={!allRequiredFieldsFilled}
              className={`save-button ${!allRequiredFieldsFilled ? 'disabled' : ''}`}
            >
              {isEditing ? 'Save Changes' : 'Create Game'}
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </>
        )}
      </div>
      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 80)" className="form-content" dependencies={[formData]}>
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
            <label htmlFor="difficulty_level">Difficulty Level:</label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="difficulty-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="field-container tags-section">
            <label>Keywords:</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={newTag}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyPress}
                placeholder="Type keywords separated by commas or press Enter"
                autoFocus
                className="tag-input"
              />
            </div>

            <div className="tags-display">
              {formData.tags.length > 0 ? (
                formData.tags.map((tag, index) => (
                  <div key={index} className="tag-button">
                    <span className="tag-text">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag"
                      title="Remove Tag"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="empty-tags-message">Keywords Display</span>
              )}
            </div>
          </div>

          <div className="field-container toggle-container">
            <div className="label">Game Visibility:</div>
            <ToggleSwitch
              checked={formData.isPublic}
              onToggle={handlePublicToggle}
              label={formData.isPublic ? 'Public Game' : 'Private Game'}
              name="isPublic"
              id="public-toggle"
            />
          </div>

          <div className="field-container toggle-container">
            <div className="label">Day Only Mode:</div>
            <ToggleSwitch
              checked={formData.dayOnly}
              onToggle={handleDayOnlyToggle}
              label={formData.dayOnly ? 'Day Only' : 'Any Time'}
              name="dayOnly"
              id="day-only-toggle"
            />
          </div>
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
