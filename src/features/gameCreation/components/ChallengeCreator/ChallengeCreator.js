import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faPlusCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { challengeTypeConfig } from '../../../../config/challengeTypeConfig';
import ScrollableContent from '../../../../components/ScrollableContent';
import { getSmallDistanceUnit, convertSmallDistance, feetToMeters, metersToFeet } from '../../../../utils/unitConversion';
import AutoExpandingTextArea from '../../../../components/AutoExpandingTextArea/AutoExpandingTextArea';
import { useMessage } from '../../../../utils/MessageProvider';
import '../../../../css/GameCreator.scss';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import { getGamesFromLocalStorage } from '../../../../utils/localStorageUtils';
import { saveGame } from '../../../gameCreation/services/gameCreatorService';
import { useGameCreation } from '../../context/GameCreationContext';
import { AISuggestionButton } from '../../../../components/AISuggestionButton/AISuggestionButton';
import '../../../../components/AISuggestionButton/AISuggestionButton.scss';

const ChallengeCreator = ({ gameData, onSave }) => {
  console.warn('[ChallengeCreator] gameData:', gameData);
  const navigate = useNavigate();
  const { gameId, challengeId } = useParams();
  const { showError, showSuccess, showWarning, clearMessage } = useMessage();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalChallenge, setOriginalChallenge] = useState(null);
  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });

  // Normalize function for game settings
  const normalizeGameSettings = (settings = {}) => {
    return {
      writingStyle: settings.writing_style || settings.writingStyle || 'default',
      gameGenre: settings.game_genre || settings.gameGenre || 'default',
      tone: settings.tone || 'default',
      customWritingStyle: settings.custom_writing_style || settings.customWritingStyle || '',
      customGameGenre: settings.custom_game_genre || settings.customGameGenre || '',
      customTone: settings.custom_tone || settings.customTone || ''
    };
  };

  // Initialize gameSettings from props
  const [gameSettings, setGameSettings] = useState(() => {
    return normalizeGameSettings(gameData?.gameSettings);
  });

  // Update gameSettings when props change
  useEffect(() => {
    if (gameData?.gameSettings) {
      const normalizedSettings = normalizeGameSettings(gameData.gameSettings);
      setGameSettings(normalizedSettings);
      gameData.gameSettings = normalizedSettings;
    }
  }, [gameData]);

  const onSettingsChange = (newSettings) => {
    const cleanSettings = normalizeGameSettings(newSettings);
    
    // Compare with current settings to avoid unnecessary updates
    const currentSettings = JSON.stringify(gameSettings);
    const updatedSettings = JSON.stringify(cleanSettings);

    if (currentSettings !== updatedSettings) {
      setGameSettings(cleanSettings);
      
      // Update through parent component
      if (gameData && onSave) {
        const updatedGame = {
          ...gameData,
          gameSettings: cleanSettings
        };
        onSave(updatedGame);
      }
    }
  };

  // Initialize challenge state with minimal values for new challenges
  const [challenge, setChallenge] = useState({
    id: '',
    type: '',  // Empty type initially
    order: 1   // Initialize order to 1 by default
  });

  const [showHints, setShowHints] = useState(false);

  const [showButtons, setShowButtons] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (hasChanges) {
      setShowButtons(true);
      setIsAnimatingOut(false);
    } else if (showButtons) { // Only animate out if buttons were showing
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShowButtons(false);
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

  useEffect(() => {
    const loadGame = () => {
      if (gameData) {
        console.log('game:', gameData);
        // Normalize loaded settings
        const loadedSettings = gameData.gameSettings || {};
        console.warn('loadedSettings:', loadedSettings);
        
        // Create the new settings object
        const newSettings = normalizeGameSettings(loadedSettings);
        
        console.warn('[ChallengeCreator] Setting new game settings:', newSettings);
        setGameSettings(newSettings);
      }
    };
    loadGame();
  }, [gameData]);

  // Load existing challenge if editing
  useEffect(() => {
    if (challengeId && gameData) {
      // Convert challengeId to number since IDs in the data are numbers
      const numericChallengeId = parseInt(challengeId, 10);
      const existingChallenge = gameData.challenges.find(c => c.id === numericChallengeId);

      if (existingChallenge) {
        // Create merged challenge with all required fields
        const mergedChallenge = {
          id: existingChallenge.id,
          type: existingChallenge.type || 'story',
          title: existingChallenge.title || '',
          description: existingChallenge.description || '',
          repeatable: existingChallenge.repeatable || false,
          order: existingChallenge.order || 0,
          feedbackTexts: {
            correct: existingChallenge.feedbackTexts?.correct || '',
            incorrect: existingChallenge.feedbackTexts?.incorrect || ['']
          },
          hints: existingChallenge.hints || [],
          options: existingChallenge.options || [],
          answers: existingChallenge.answers || [''],
          targetLocation: existingChallenge.targetLocation || { latitude: '', longitude: '' },
          radius: existingChallenge.radius || '',
          completionFeedback: existingChallenge.completionFeedback || '',  // Added for travel challenges
          question: existingChallenge.question || '',
          correctAnswer: existingChallenge.type === 'trueFalse'
            ? (existingChallenge.correctAnswer === undefined ? false : existingChallenge.correctAnswer)
            : (existingChallenge.correctAnswer || '')
        };

        setChallenge(mergedChallenge);
        setOriginalChallenge(mergedChallenge);
        setIsEditing(true);
      }
    } else if (gameData) {
      // Set next available order for new challenges
      const maxOrder = gameData.challenges?.length > 0
        ? Math.max(...gameData.challenges.map(c => c.order || 0), 0)
        : 0;
      setChallenge(prev => ({

        ...prev,
        order: maxOrder + 1  // Set order to next available number
      }));
    }
  }, [gameId, challengeId, gameData]);

  // Track changes and validate required fields
  useEffect(() => {
    if (isEditing && originalChallenge) {
      const changed = JSON.stringify(challenge) !== JSON.stringify(originalChallenge);
      setHasChanges(changed);
    }
  }, [challenge, originalChallenge, isEditing]);

  // Validate required fields
  const validateFields = () => {
    if (!challenge.type) return false;

    const typeFields = challengeTypeConfig[challenge.type];
    const missingFields = [];

    for (const [fieldName, config] of Object.entries(typeFields)) {
      if (config.required) {
        const value = challenge[fieldName];
        if (value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)) {
          missingFields.push(config.label || fieldName);
        }
      }
    }

    return missingFields;
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        navigate(`/create/edit/${gameId}/challenges`);
      }
    } else {
      navigate(`/create/edit/${gameId}/challenges`);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
        if (isEditing) {
          setChallenge(originalChallenge);
          setHasChanges(false);
        } else {
          navigate(`/create/edit/${gameId}/challenges`);
        }
      }
    } else {
      navigate(`/create/edit/${gameId}/challenges`);
    }
  };

  const handleInputChange = (nameOrEvent, directValue) => {
    clearMessage();

    // If directValue is provided, it's a direct update
    if (directValue !== undefined) {
      const name = nameOrEvent;
      
      // Handle nested fields for direct updates
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setChallenge(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: directValue
          }
        }));
        return;
      }

      setChallenge(prev => ({
        ...prev,
        [name]: directValue
      }));
      return;
    }

    // Otherwise handle as a regular event
    const { name, value, type, checked } = nameOrEvent.target;
    
    // Special handling for type field
    if (name === 'type') {
      // Initialize default values for the selected challenge type
      const defaultValues = {
        id: challenge.id,
        type: value,
        order: challenge.order,
        title: '',
        description: '',
        question: '',
        feedbackTexts: { correct: '', incorrect: [''] },
        hints: [],
        options: value === 'multipleChoice' ? [''] : [],
        correctAnswer: value === 'trueFalse' ? false : '',
        targetLocation: { latitude: '', longitude: '' },
        radius: '',
        completionFeedback: '',  // Added for travel challenges
        repeatable: false        // Added for story challenges
      };
      setChallenge(defaultValues);
      return;
    }

    // Handle nested fields (like feedbackTexts.correct)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setChallenge(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      return;
    }

    // Handle checkbox fields
    if (type === 'checkbox') {
      setChallenge(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }

    // Handle all other fields
    setChallenge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addIncorrectFeedback = () => {
    setChallenge(prev => ({
      ...prev,
      feedbackTexts: {
        ...prev.feedbackTexts,
        incorrect: [...(prev.feedbackTexts?.incorrect || []), '']
      }
    }));
  };

  const removeIncorrectFeedback = (index) => {
    setChallenge(prev => {
      // Don't remove if it's the last incorrect feedback
      if (prev.feedbackTexts?.incorrect?.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        feedbackTexts: {
          ...prev.feedbackTexts,
          incorrect: prev.feedbackTexts.incorrect.filter((_, i) => i !== index)
        }
      };
    });
  };

  const handleFeedbackChange = (e, type, index) => {
    clearMessage();
    const { value } = e.target;

    setChallenge(prev => {
      if (type === 'correct') {
        return {
          ...prev,
          feedbackTexts: {
            ...prev.feedbackTexts,
            correct: value
          }
        };
      } else {
        const newIncorrect = [...prev.feedbackTexts.incorrect];
        newIncorrect[index] = value;
        return {
          ...prev,
          feedbackTexts: {
            ...prev.feedbackTexts,
            incorrect: newIncorrect
          }
        };
      }
    });
  };

  const addArrayItem = (fieldName) => {
    setChallenge(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), '']
    }));
  };

  const removeArrayItem = (index, fieldName) => {
    const fieldConfig = challengeTypeConfig[challenge.type][fieldName];
    if (fieldConfig.required && (!challenge[fieldName] || challenge[fieldName].length <= 1)) {
      showWarning(`At least one ${fieldConfig.label || fieldName} is required`);
      return;
    }
    setChallenge(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (e, index, fieldName) => {
    clearMessage();
    const { value } = e.target;
    setChallenge(prev => {
      const newArray = [...(prev[fieldName] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray
      };
    });
  };

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setChallenge(prev => ({
            ...prev,
            targetLocation: { latitude, longitude }
          }));
          showSuccess("Location successfully updated");
        },
        (error) => {
          console.error("Error getting location:", error);
          showError("Unable to get your location. Please check your browser settings and try again.");
        }
      );
    } else {
      showError("Geolocation is not supported by your browser.");
    }
  };

  const handleToggleChange = (fieldName) => {
    clearMessage();
    setChallenge(prev => ({
      ...prev,
      [fieldName]: fieldName === 'correctAnswer' && prev.type === 'trueFalse'
        ? !prev[fieldName]  // For true/false challenges, toggle between true/false
        : !prev[fieldName]  // For other toggles, just invert the value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = validateFields();
    if (missingFields.length > 0) {
      showError(`Please fill in all required fields:\n${missingFields.join('\n')}`);
      return;
    }

    try {
      if (gameData && onSave) {
        let updatedGame = { ...gameData };

        // If editing, update existing challenge
        if (isEditing) {
          const challengeIndex = gameData.challenges.findIndex(c => c.id === parseInt(challengeId, 10));
          if (challengeIndex !== -1) {
            updatedGame.challenges[challengeIndex] = {
              ...challenge,
              id: parseInt(challengeId, 10) // Keep original ID
            };
          }
        } else {
          // For new challenges
          const newChallenge = {
            ...challenge,
            id: Date.now() // Only set new ID for new challenges
          };
          updatedGame.challenges = [...(updatedGame.challenges || []), newChallenge];
        }

        // Update through parent component
        onSave(updatedGame);

        showSuccess('Challenge saved successfully!');
        navigate(`/create/edit/${gameId}/challenges`);
      }
    } catch (error) {
      console.error('Save challenge error:', error); // Log full error for debugging
      showError('Failed to save challenge. Please try again.'); // User-friendly message
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    // Get the value for this field
    const value = fieldName === 'targetLocation'
      ? challenge.targetLocation
      : challenge[fieldName];

    // For hints, show them if they exist, regardless of showHints state
    if (fieldName === 'hints' && !showHints && (!value || value.length === 0)) {
      return null;
    }

    // Skip if value is explicitly undefined (not just null or empty)
    if (value === undefined) return null;

    switch (fieldConfig.type) {
      case 'text':
        return (
          <div className="input-with-ai">
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={value || ''}
              onChange={handleInputChange}
              onBlur={() => {
                if (!value && fieldConfig.required) {
                  showWarning(`${fieldConfig.label || fieldName} is required`);
                }
              }}
              required={fieldConfig.required}
              placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label || fieldName}`}
            />
            <AISuggestionButton
              field={fieldName}
              gameObject={gameData}
              existingContent={value || ''}
              onSelect={(suggestion) => handleInputChange(fieldName, suggestion)}
              onSettingsChange={onSettingsChange}
              scope="challenge"
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="input-with-ai">
            <AutoExpandingTextArea
              id={fieldName}
              name={fieldName}
              value={value || ''}
              onChange={(e) => handleInputChange(e)}
              onBlur={() => {
                if (!value && fieldConfig.required) {
                  showWarning(`${fieldConfig.label || fieldName} is required`);
                }
              }}
              required={fieldConfig.required}
              placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label || fieldName}`}
              maxHeight="50vh"
              minHeight="60px"
            />
            <AISuggestionButton
              field={fieldName}
              gameObject={gameData}
              existingContent={value || ''}
              onSelect={(suggestion) => handleInputChange(fieldName, suggestion)}
              onSettingsChange={onSettingsChange}
              scope="challenge"
            />
          </div>
        );
      case 'number':
        // For radius field, handle unit conversion
        const displayValue = fieldName === 'radius'
          ? (value === '' ? '' : (isMetric ? value : Math.round(metersToFeet(value))))
          : value;

        return (
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={displayValue}
            onChange={(e) => {
              if (fieldName === 'radius') {
                const inputValue = e.target.value;
                
                // Store empty value as is
                if (inputValue === '') {
                  setChallenge(prev => ({ ...prev, [fieldName]: '' }));
                  return;
                }

                // Convert if not metric, otherwise store as is
                const valueToStore = isMetric 
                  ? parseFloat(inputValue)
                  : feetToMeters(parseFloat(inputValue));

                setChallenge(prev => ({
                  ...prev,
                  [fieldName]: valueToStore
                }));
              } else {
                handleInputChange(e);
              }
            }}
            min="0"
            step="1"
            onBlur={() => {
              if (fieldConfig.required && (value === '' || value === null)) {
                showWarning(`${fieldConfig.label || fieldName} is required`);
              }
            }}
            required={fieldConfig.required}
          />
        );
      case 'boolean':
        if (challenge.type === 'trueFalse' && fieldName === 'correctAnswer') {
          return (
            <div className="true-false-toggle">
              <ToggleSwitch
                checked={value ?? false}
                onToggle={() => handleToggleChange(fieldName)}
                label={value ? 'True' : 'False'}
              />
            </div>
          );
        }
        if (fieldName === 'repeatable') {
          return (
            <div className="repeatable-toggle">
              <ToggleSwitch
                checked={value ?? false}
                onToggle={() => handleToggleChange(fieldName)}
                label={value ? 'Repeatable' : 'Not Repeatable'}
              />
            </div>
          );
        }
        return (
          <input
            type="checkbox"
            checked={value ?? false}
            onChange={(e) => handleInputChange(e)}
            required={fieldConfig.required}
          />
        );
      case 'array':
        return (
          <div className="array-field">
            {value.map((item, index) => (
              <div key={index} className="array-item">
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem(index, fieldName)}
                  title={`Remove ${fieldConfig.label}`}
                >
                  <FontAwesomeIcon icon={faBan} />
                </button>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(e, index, fieldName)}
                  onBlur={() => {
                    if (!item.trim() && fieldConfig.required) {
                      showWarning(`${fieldConfig.label || fieldName} items cannot be empty`);
                    }
                  }}
                  required={fieldConfig.required}
                  placeholder={`Enter ${fieldConfig.label || fieldName}`}
                />
              </div>
            ))}

          </div>
        );
      case 'location':
        const handleCoordinateInput = (e, field) => {
          const input = e.target.value;
          
          // Check if input contains a comma
          if (input.includes(',')) {
            const [lat, long] = input.split(',').map(val => val.trim());
            const numLat = parseFloat(lat);
            const numLong = parseFloat(long);
            
            // Only update if both values are valid numbers
            if (!isNaN(numLat) && !isNaN(numLong)) {
              // Clear the input field value first
              e.target.value = '';
              
              setChallenge(prev => ({
                ...prev,
                [fieldName]: {
                  ...prev[fieldName],
                  latitude: numLat,
                  longitude: numLong
                }
              }));
              setHasChanges(true); // Trigger save prompt
            }
          } else {
            // Handle single coordinate input
            const trimmedInput = input.trim();
            const numValue = trimmedInput === '' ? '' : parseFloat(trimmedInput);
            
            if (trimmedInput === '' || !isNaN(numValue)) {
              setChallenge(prev => {
                const newLocation = {
                  ...prev[fieldName],
                  [field]: numValue
                };
                
                // If both coordinates are now set, trigger save prompt
                if (newLocation.latitude !== '' && 
                    newLocation.longitude !== '' && 
                    !isNaN(newLocation.latitude) && 
                    !isNaN(newLocation.longitude)) {
                  setHasChanges(true);
                }
                
                return {
                  ...prev,
                  [fieldName]: newLocation
                };
              });
            }
          }
        };

        return (
          <div className="location-container">
            <div className="location-inputs">
              <div className="location-field">
                <label htmlFor={`${fieldName}.latitude`}>Latitude</label>
                <input
                  type="text"
                  id={`${fieldName}.latitude`}
                  name={`${fieldName}.latitude`}
                  value={value?.latitude ?? ''}
                  onChange={(e) => handleCoordinateInput(e, 'latitude')}
                  placeholder="latitude or paste coordinates"
                />
              </div>
              <div className="location-field">
                <label htmlFor={`${fieldName}.longitude`}>Longitude</label>
                <input
                  type="text"
                  id={`${fieldName}.longitude`}
                  name={`${fieldName}.longitude`}
                  value={value?.longitude ?? ''}
                  onChange={(e) => handleCoordinateInput(e, 'longitude')}
                  placeholder="longitude or paste coordinates"
                />
              </div>
            </div>
            <button
              type="button"
              className="use-location-button"
              onClick={handleUseMyLocation}
            >
              Use My Location
            </button>
          </div>
        );
      case 'feedback':
        // Only render feedback fields for non-travel challenges
        if (challenge.type !== 'travel') {
          return (
            <div className="form-group">
              <label>{fieldConfig.label}{fieldConfig.required && <span className="required">*</span>}</label>
              <div className="array-field">
                <div className="feedback-section">
                  <div className="section-header">
                    <label>Correct Answer Feedback{fieldConfig.required && <span className="required">*</span>}</label>
                  </div>
                  <div className="array-item">
                    <AutoExpandingTextArea
                      id="feedbackTexts.correct"
                      name="feedbackTexts.correct"
                      value={value?.correct || ''}
                      onChange={(e) => handleFeedbackChange(e, 'correct', 0)}
                      onBlur={() => {
                        if (!value?.correct && fieldConfig.required) {
                          showWarning('Correct answer feedback is required');
                        }
                      }}
                      required={fieldConfig.required}
                      placeholder="Enter feedback for correct answers"
                      maxHeight="50vh"
                      minHeight="60px"
                    />
                  </div>
                </div>
                <div className="feedback-section">
                  <div className="section-header">
                    <label>Incorrect Answer Feedback{fieldConfig.required && <span className="required">*</span>}</label>
                    <button
                      type="button"
                      className="btn-add"
                      onClick={addIncorrectFeedback}
                      title="Add another incorrect feedback"
                    >
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </button>
                  </div>
                  {value?.incorrect?.map((feedback, index) => (
                    <div key={index} className="array-item">
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeIncorrectFeedback(index)}
                        title="Remove feedback"
                        disabled={value.incorrect.length === 1}
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </button>
                      <AutoExpandingTextArea
                        name={`feedbackTexts.incorrect.${index}`}
                        value={feedback}
                        onChange={(e) => handleFeedbackChange(e, 'incorrect', index)}
                        onBlur={() => {
                          if (!feedback.trim() && fieldConfig.required) {
                            showWarning('Incorrect answer feedback cannot be empty');
                          }
                        }}
                        required={fieldConfig.required}
                        placeholder="Enter feedback for incorrect answers"
                        maxHeight="50vh"
                        minHeight="60px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const renderFields = (fields) => {
    return fields.map(([fieldName, fieldConfig]) => {
      if (fieldName === 'type') return null;

      // For feedback fields, render without the extra form-group wrapper
      if (fieldConfig.type === 'feedback') {
        return renderField(fieldName, fieldConfig);
      }

      // Update the radius label to include the unit
      const radiusLabel = fieldName === 'radius' 
        ? `Radius (${getSmallDistanceUnit(isMetric)})` 
        : fieldConfig.label || fieldName;

      return (
        <div key={fieldName} className="form-group">
          <div className="field-header">
            <label htmlFor={fieldName}>
              {radiusLabel}
              {fieldConfig.required && <span className="required">*</span>}
            </label>
            {(fieldName === 'hints' || fieldName === 'options') && (
              <button
                type="button"
                className="btn-add"
                onClick={() => {
                  if (fieldName === 'hints') {
                    setShowHints(true);
                    if (!challenge.hints || challenge.hints.length === 0) {
                      setChallenge(prev => ({
                        ...prev,
                        hints: ['']
                      }));
                    } else {
                      addArrayItem('hints');
                    }
                  } else if (fieldName === 'options') {
                    if (!challenge.options || challenge.options.length === 0) {
                      setChallenge(prev => ({
                        ...prev,
                        options: ['']
                      }));
                    } else {
                      addArrayItem('options');
                    }
                  }
                }}
                title={`Add ${fieldConfig.label || fieldName}`}
              >
                <FontAwesomeIcon icon={faPlusCircle} />
              </button>
            )}
          </div>
          {renderField(fieldName, fieldConfig)}
        </div>
      );
    });
  };

  const getChallengeContext = () => ({
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    tags: []  // We could potentially add tags at the challenge level in the future
  });

  const typeConfig = challengeTypeConfig[challenge.type] || {};
  const hasHintsField = typeConfig.hints !== undefined;

  return (
    <form onSubmit={handleSubmit} className="creator-form">
      <button type="button" className="back-button" onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="creator-header">
        <h2>{isEditing ? 'Edit Challenge' : 'Create New Challenge'}</h2>
        {/* Save/Cancel Buttons - Always visible for new challenges */}
        <div className={`button-container ${(!isEditing || showButtons) ? '' : 'sliding-up'}`}>
          <button
            type="submit"
            className="save-button"
            disabled={validateFields().length > 0}
          >
            {isEditing ? 'Save Changes' : 'Create Challenge'}
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      {/* Challenge Type and Order */}
      <div className="type-order-container">
        <div className="challenge-type-selector">
          <label htmlFor="type">Challenge Type:</label>
          <select
            id="type"
            name="type"
            value={challenge.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a type</option>
            {Object.keys(challengeTypeConfig).map(type => (
              <option key={type} value={type}>
                {challengeTypeConfig[type].label || type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 70)">
        {/* Dynamic Fields - Only show if type is selected */}
        {challenge.type && renderFields(Object.entries(challengeTypeConfig[challenge.type]).filter(([fieldName]) => fieldName !== 'order'))}
      </ScrollableContent>
    </form>
  );
};

export default ChallengeCreator;
