import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlay, faInfoCircle, faPlusCircle, faTimes, faImage, faEdit } from '@fortawesome/free-solid-svg-icons';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import AutoExpandingTextArea from '../../../../components/AutoExpandingTextArea/AutoExpandingTextArea';
import ChallengeCard from '../ChallengeCard/ChallengeCard';
import ScrollableContent from '../../../../components/ScrollableContent';
import ImageUploadModal from '../ImageUploadModal/ImageUploadModal';
import { isValidGame } from '../../services/gameCreatorService';
import { uploadGameImage, deleteGameImage } from '../../services/gameCreatorService';
import { useMessage } from '../../../../utils/MessageProvider';
import { API_URL } from '../../../../utils/utils';
import { setPlaytestState } from '../../../../utils/localStorageUtils';
import '../../../../css/GameCreator.scss';
import { AISuggestionButton } from '../../../../components/AISuggestionButton/AISuggestionButton';
import '../../../../components/AISuggestionButton/AISuggestionButton.scss';

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
    dayOnly: false,
    image_url: '',
    image_data: '',
    imageDeleted: false,
    gameSettings: {}
  });
  const [originalData, setOriginalData] = useState({
    title: '',
    description: '',
    isPublic: false,
    gameId: '',
    challenges: [],
    difficulty_level: 'medium',
    tags: [],
    dayOnly: false,
    image_url: '',
    image_data: '',
    imageDeleted: false,
    gameSettings: {}
  });
  const [isSaved, setIsSaved] = useState(isEditing);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState({
    loading: false,
    error: null
  });

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handleImageChange = async (image_data) => {
    setImageStatus({ loading: true, error: null });
    try {
      if (typeof image_data === 'object' && image_data.image_url === '') {
        // Handle image deletion
        const updatedData = {
          ...formData,
          image_url: '',
          image_data: '',
          imageDeleted: true
        };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setImageStatus({ loading: false, error: null });
        await onSave(updatedData);
        closeImageModal();
      } else {
        // Handle image upload
        const response = await uploadGameImage(formData.gameId, image_data);
        const updatedData = {
          ...formData,
          image_url: `${response.image_url}?t=${Date.now()}`,
          imageDeleted: false
        };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setImageStatus({ loading: false, error: null });
        await onSave(updatedData);
        closeImageModal();
      }
    } catch (error) {
      console.error('Error handling image:', error);
      setImageStatus({ loading: false, error: error.message });
      showError(error.message || 'Failed to process image');
    }
  };

  // Initialize both formData and originalData when gameData changes
  useEffect(() => {
    if (gameData) {
      console.log('[GameForm] Initial game data:', gameData);
      let normalizedGameSettings = null;
      
      // Handle game settings from either gameSettings (client) or game_settings (server)
      const rawSettings = gameData.gameSettings || gameData.game_settings;
      
      if (rawSettings && rawSettings !== "0") {
        try {
          let settings;
          if (typeof rawSettings === 'string') {
            settings = JSON.parse(rawSettings);
          } else if (typeof rawSettings === 'object') {
            settings = rawSettings;
          }
          
          if (settings) {
            normalizedGameSettings = {
              writingStyle: settings.writing_style || settings.writingStyle || 'default',
              gameGenre: settings.game_genre || settings.gameGenre || 'default',
              tone: settings.tone || 'default',
              customWritingStyle: settings.custom_writing_style || settings.customWritingStyle || '',
              customGameGenre: settings.custom_game_genre || settings.customGameGenre || '',
              customTone: settings.custom_tone || settings.customTone || ''
            };
            console.log('[GameForm] Normalized game settings:', normalizedGameSettings);
          }
        } catch (e) {
          console.error('[GameForm] Error parsing game settings:', e);
        }
      } else {
        console.log('[GameForm] No game settings found or settings is "0"');
      }

      const initialData = {
        title: gameData.title || '',
        description: gameData.description || '',
        isPublic: gameData.is_public || gameData.isPublic || false,
        gameId: gameData.gameId || '',
        challenges: gameData.challenges || [],
        difficulty_level: gameData.difficulty_level || 'medium',
        dayOnly: gameData.dayOnly || false,
        tags: gameData.tags || [],
        image_url: gameData.image_url || '',
        image_data: '',
        imageDeleted: false,
        gameSettings: normalizedGameSettings
      };
      console.log('[GameForm] Initialized form data:', initialData);
      setFormData(initialData);
      setOriginalData(initialData);
    }
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

  const handleInputChange = (nameOrEvent, directValue) => {
    // If directValue is provided, it's a direct update
    if (directValue !== undefined) {
      setFormData(prev => ({
        ...prev,
        [nameOrEvent]: directValue
      }));
      return;
    }

    // Otherwise handle as a regular event
    const { name, value, type, checked } = nameOrEvent.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getGameContext = () => ({
    title: formData.title,
    description: formData.description,
    difficulty_level: formData.difficulty_level,
    tags: formData.tags
  });

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
    console.log('[GameForm] Submitting form data:', formData);
    if (isValidGame(formData)) {
      try {
        const submittedData = {
          ...formData,
          challenges: formData.challenges || []
        };
        await onSave(submittedData);
        const newOriginalData = JSON.parse(JSON.stringify(submittedData));
        setOriginalData(newOriginalData);
        setHasChanges(false);
        setIsSaved(true);
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
    if (formData?.gameId) {
      // Save game data to localStorage before starting playtest
      const { saveDownloadedGame } = require('../../../../utils/localStorageUtils');
      saveDownloadedGame(formData);
      setPlaytestState(formData.gameId);
      navigate(`/gamedescription/${formData.gameId}`);
    }
  };

  const handleCancel = () => {
    // Reset form data to original state
    setFormData(JSON.parse(JSON.stringify(originalData)));
    setHasChanges(false);
  };

  const handleGameSettingsChange = async (settings) => {
    console.log('[GameForm] Received game settings:', settings);
    
    // Clean up settings for comparison
    const cleanSettings = {
      writingStyle: settings.writingStyle || 'default',
      gameGenre: settings.gameGenre || 'default',
      tone: settings.tone || 'default',
      customWritingStyle: settings.customWritingStyle || '',
      customGameGenre: settings.customGameGenre || '',
      customTone: settings.customTone || ''
    };
    
    // Compare with current settings
    const currentSettings = JSON.stringify(formData.gameSettings || {});
    const newSettings = JSON.stringify(cleanSettings);
    
    if (currentSettings !== newSettings) {
      try {
        const updatedFormData = {
          ...formData,
          gameSettings: cleanSettings
        };
        console.log('[GameForm] Updated form data:', updatedFormData);
        
        // Update form state
        setFormData(updatedFormData);
        
        // Auto-save the game
        if (onSave) {
          console.log('[GameForm] Auto-saving game with new settings...');
          await onSave(updatedFormData);
          showSuccess('Game settings saved successfully');
        }
      } catch (error) {
        console.error('[GameForm] Error saving game settings:', error);
        showError('Failed to save game settings');
      }
    } else {
      console.log('[GameForm] Settings unchanged, skipping save');
    }
  };

  return (
    <div className="creator-form">
      <button onClick={handleBack} className="back-button" title="Back to Games">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>

      <div className="creator-header">
        <h2>{isEditing ? 'Edit Game' : 'Create New Game'}</h2>
        {(isEditing || formData.gameId) && (
          <button
            className="playtest-button"
            onClick={handlePlaytest}
            title="Playtest Game"
            disabled={!allRequiredFieldsFilled}
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

            {(isEditing || isSaved) && (
              <div className="image-section">
                {formData.image_url ? (
                  <div className="current-image" onClick={openImageModal}>
                    <div className="image-container">
                      <img src={`${API_URL}${formData.image_url}`} alt='Game image' />
                      {imageStatus.loading && (
                        <div className="loading-overlay">
                          <span>Uploading...</span>
                        </div>
                      )}
                    </div>
                    <div className="edit-icon">
                      <FontAwesomeIcon icon={faEdit} />
                    </div>
                  </div>
                ) : (
                  <button
                    className="upload-button"
                    onClick={openImageModal}
                  >
                    <FontAwesomeIcon icon={faImage} />
                    <span>Add Cover Image</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="field-container">
            <label htmlFor="title">Game Title:</label>
            <div className="input-with-ai">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter game name"
                required
              />
              <AISuggestionButton
                field="title"
                context={getGameContext()}
                existingContent={formData.title}
                onSelect={(suggestion) => handleInputChange('title', suggestion)}
                onSettingsChange={handleGameSettingsChange}
                gameSettings={formData.gameSettings}
              />
            </div>
          </div>

          <div className="field-container">
            <label htmlFor="description">Description:</label>
            <div className="input-with-ai">
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
              <AISuggestionButton
                field="description"
                context={getGameContext()}
                existingContent={formData.description}
                onSelect={(suggestion) => handleInputChange('description', suggestion)}
                onSettingsChange={handleGameSettingsChange}
                gameSettings={formData.gameSettings}
              />
            </div>
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

        {
          isEditing && (
            <div className="side-options">
              <ChallengeCard
                challengeCount={formData.challenges?.length || 0}
                onClick={handleChallengesClick}
              />
            </div>
          )
        }
      </ScrollableContent>
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        onImageChange={handleImageChange}
        currentImage={formData.image_url ? `${API_URL}${formData.image_url}` : ''}
        gameId={formData.gameId}
      />
    </div>
  );
};

export default GameForm;
