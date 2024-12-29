import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBan, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { challengeTypeConfig } from '../../../../config/challengeTypeConfig';
import ScrollableContent from '../../../../components/ScrollableContent';
import { feetToMeters, metersToFeet, getSmallDistanceUnit } from '../../../../utils/unitConversion';
import { useMessage } from '../../../../utils/MessageProvider';
import '../../../../css/GameCreator.scss';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import { getGamesFromLocalStorage } from '../../../../utils/localStorageUtils';
import { saveGame } from '../../../gameCreation/services/gameCreatorService';
import { useGameCreation } from '../../context/GameCreationContext';

const ChallengeCreator = () => {
  const navigate = useNavigate();
  const { gameId, challengeId } = useParams();
  const { showError, showSuccess, showWarning, clearMessage } = useMessage();
  const { dispatch } = useGameCreation();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalChallenge, setOriginalChallenge] = useState(null);

  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });

  // Initialize challenge state with minimal values for new challenges
  const [challenge, setChallenge] = useState({
    id: '',
    type: '',  // Empty type initially
    order: 1   // Initialize order to 1 by default
  });

  const [showHints, setShowHints] = useState(false);

  // Load existing challenge if editing
  useEffect(() => {
    const games = getGamesFromLocalStorage();
    console.log('Games from storage:', games);
    const game = games.find(g => g.gameId === gameId);
    console.log('Found game:', game, 'looking for gameId:', gameId);

    if (challengeId && game) {
      console.log('Loading challenge:', challengeId, typeof challengeId);
      // Convert challengeId to number since IDs in the data are numbers
      const numericChallengeId = parseInt(challengeId, 10);
      console.log('Numeric challenge ID:', numericChallengeId);
      const existingChallenge = game.challenges.find(c => c.id === numericChallengeId);
      console.log('Found existing challenge:', existingChallenge);

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
          question: existingChallenge.question || '',
          correctAnswer: existingChallenge.type === 'trueFalse' 
            ? (existingChallenge.correctAnswer === undefined ? false : existingChallenge.correctAnswer)
            : (existingChallenge.correctAnswer || '')
        };

        console.log('Setting merged challenge:', mergedChallenge);
        setChallenge(mergedChallenge);
        setOriginalChallenge(mergedChallenge);
        setIsEditing(true);
      }
    } else if (game) {
      // Set next available order for new challenges
      const maxOrder = game.challenges?.length > 0
        ? Math.max(...game.challenges.map(c => c.order || 0), 0)
        : 0;
      setChallenge(prev => ({
        ...prev,
        order: maxOrder + 1  // Set order to next available number
      }));
      console.log('Setting new challenge order to:', maxOrder + 1);
    }
  }, [gameId, challengeId]);

  // Track changes
  useEffect(() => {
    if (isEditing && originalChallenge) {
      const changed = JSON.stringify(challenge) !== JSON.stringify(originalChallenge);
      console.log('Change detection:', {
        isEditing,
        challenge,
        originalChallenge,
        changed
      });
      setHasChanges(changed);
    }
  }, [challenge, originalChallenge, isEditing]);

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

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    clearMessage();

    let updatedValue = value;
    if (name === 'radius') {
      updatedValue = value === '' ? '' : isMetric ? parseFloat(value) : feetToMeters(parseFloat(value));
    } else if (inputType === 'checkbox') {
      updatedValue = checked;
    }

    if (name === 'type') {
      // When changing challenge type, initialize the new type's fields
      const baseFields = {
        title: challenge.title || '',
        description: challenge.description || '',
        repeatable: challenge.repeatable || false,
        order: challenge.order || null,
        id: challenge.id || '',
        type: value,
        hints: []
      };

      let typeSpecificFields = {};
      switch (value) {
        case 'travel':
          typeSpecificFields = {
            targetLocation: challenge.targetLocation || { latitude: '', longitude: '' },
            radius: challenge.radius || '',
            completionFeedback: challenge.completionFeedback || '',
            description: challenge.description || ''
          };
          break;
        case 'story':
          typeSpecificFields = {
            description: challenge.description || '',
            feedbackTexts: { correct: '', incorrect: [''] }
          };
          break;
        case 'multipleChoice':
          typeSpecificFields = {
            question: challenge.question || '',
            options: challenge.options?.length > 0 ? challenge.options : [''],
            correctAnswer: challenge.correctAnswer || '',
            feedbackTexts: { 
              correct: challenge.feedbackTexts?.correct || '',
              incorrect: challenge.feedbackTexts?.incorrect || ['']
            }
          };
          break;
        case 'trueFalse':
          typeSpecificFields = {
            question: '',
            correctAnswer: false,
            feedbackTexts: { correct: '', incorrect: [''] }
          };
          break;
        case 'textInput':
          typeSpecificFields = {
            question: '',
            correctAnswer: '',
            feedbackTexts: { correct: '', incorrect: [''] }
          };
          break;
      }

      setChallenge({
        ...baseFields,
        ...typeSpecificFields
      });
      return;
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'targetLocation') {
        setChallenge(prev => ({
          ...prev,
          targetLocation: {
            ...prev.targetLocation,
            [child]: updatedValue
          }
        }));
      } else {
        setChallenge(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: updatedValue
          }
        }));
      }
    } else if (inputType === 'checkbox') {
      setChallenge(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setChallenge(prev => ({
        ...prev,
        [name]: updatedValue
      }));
    }
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

    try {
      const games = getGamesFromLocalStorage();
      const game = games.find(g => g.gameId === gameId);

      if (!game) {
        showError('Game not found');
        return;
      }

      let updatedGame = { ...game };

      // If editing, update existing challenge
      if (isEditing) {
        const challengeIndex = game.challenges.findIndex(c => c.id === parseInt(challengeId, 10));
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

      // Save to local storage
      await saveGame(updatedGame);

      // Update context
      dispatch({ type: 'SET_GAMES', payload: games.map(g => g.gameId === gameId ? updatedGame : g) });
      dispatch({ type: 'SELECT_GAME', payload: updatedGame });

      showSuccess('Challenge saved successfully!');
      navigate(`/create/edit/${gameId}/challenges`);
    } catch (error) {
      showError('Failed to save challenge: ' + error.message);
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
            placeholder={`Enter ${fieldConfig.label || fieldName}`}
          />
        );
      case 'textarea':
        // Special handling for feedbackTexts field
        if (fieldName === 'feedbackTexts') {
          return (
            <div className="array-field">
              <div className="array-item">
                <label>
                  Correct Answer Feedback
                  {fieldConfig.required && <span className="required">*</span>}
                </label>
                <textarea
                  id="feedbackTexts.correct"
                  name="feedbackTexts.correct"
                  value={value.correct || ''}
                  onChange={handleInputChange}
                  onBlur={() => {
                    if (!value.correct && fieldConfig.required) {
                      showWarning('Correct answer feedback is required');
                    }
                  }}
                  required={fieldConfig.required}
                  placeholder="Enter feedback for correct answers"
                />
              </div>
              <div className="feedback-section">
                <div className="section-header">
                  <label>
                    Incorrect Answer Feedback
                    {fieldConfig.required && <span className="required">*</span>}
                  </label>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => addIncorrectFeedback()}
                    title="Add another incorrect feedback"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </button>
                </div>
                {value.incorrect.map((feedback, index) => (
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
                    <textarea
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
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // Regular textarea for other fields
        return (
          <textarea
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleInputChange}
            onBlur={() => {
              if (!value && fieldConfig.required) {
                showWarning(`${fieldConfig.label || fieldName} is required`);
              }
            }}
            required={fieldConfig.required}
          />
        );
      case 'number':
        const displayValue = fieldName === 'radius' 
          ? (value === '' ? '' : (isMetric ? value : metersToFeet(value)))
          : value;
        return (
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={displayValue}
            onChange={handleInputChange}
            min="0"
            step={fieldName === 'radius' ? '1' : 'any'}
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
        return (
          <div className="location-field">
            <div className="location-inputs">
              <div className="form-group">
                <label htmlFor={`${fieldName}.latitude`}>Latitude</label>
                <input
                  type="number"
                  id={`${fieldName}.latitude`}
                  name={`${fieldName}.latitude`}
                  value={value?.latitude || ''}
                  onChange={handleInputChange}
                  step="any"
                  required={fieldConfig.required}
                />
              </div>
              <div className="form-group">
                <label htmlFor={`${fieldName}.longitude`}>Longitude</label>
                <input
                  type="number"
                  id={`${fieldName}.longitude`}
                  name={`${fieldName}.longitude`}
                  value={value?.longitude || ''}
                  onChange={handleInputChange}
                  step="any"
                  required={fieldConfig.required}
                />
              </div>
            </div>
            <button type="button" onClick={handleUseMyLocation} className="use-location-button">
              Use My Location
            </button>
          </div>
        );
      case 'feedback':
        return (
          <div className="form-group">
            <label>{fieldConfig.label}{fieldConfig.required && <span className="required">*</span>}</label>
            <div className="array-field">
              <div className="feedback-section">
                <div className="section-header">
                  <label>Correct Answer Feedback{fieldConfig.required && <span className="required">*</span>}</label>
                </div>
                <div className="array-item">
                  <textarea
                    id="feedbackTexts.correct"
                    name="feedbackTexts.correct"
                    value={value.correct || ''}
                    onChange={handleInputChange}
                    onBlur={() => {
                      if (!value.correct && fieldConfig.required) {
                        showWarning('Correct answer feedback is required');
                      }
                    }}
                    required={fieldConfig.required}
                    placeholder="Enter feedback for correct answers"
                  />
                </div>
              </div>
              <div className="feedback-section">
                <div className="section-header">
                  <label>Incorrect Answer Feedback{fieldConfig.required && <span className="required">*</span>}</label>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => addIncorrectFeedback()}
                    title="Add another incorrect feedback"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </button>
                </div>
                {value.incorrect.map((feedback, index) => (
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
                    <textarea
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
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFields = () => {
    if (!challenge.type) return null;

    return Object.entries(challengeTypeConfig[challenge.type]).map(([fieldName, fieldConfig]) => {
      if (fieldName === 'type') return null;
      
      // For feedback fields, render without the extra form-group wrapper
      if (fieldConfig.type === 'feedback') {
        return renderField(fieldName, fieldConfig);
      }

      const radiusLabel = fieldName === 'radius' ? `Radius ${isMetric ? '(in meters)' : '(in feet)'} *` : fieldConfig.label || fieldName;
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

  const typeConfig = challengeTypeConfig[challenge.type] || {};
  const hasHintsField = typeConfig.hints !== undefined;

  return (
    <form onSubmit={handleSubmit} className="challenge-creator challenge-form">
      <button type="button" className="back-button" onClick={handleBack} title="Back">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="challenge-creator-header">

        <h2>{isEditing ? 'Edit Challenge' : 'Create New Challenge'}</h2>
      </div>

      {/* Challenge Type Selection */}
      <div className="form-group">
        <label htmlFor="type">Challenge Type<span className="required">*</span></label>
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

      <ScrollableContent maxHeight="60vh">
        {/* Dynamic Fields - Only show if type is selected */}
        {challenge.type && renderFields()}

        {/* Save/Cancel Buttons - Show if editing with changes, or if creating new */}
        {(hasChanges || !isEditing) && (
          <div className="button-container">
            <button type="submit" className="save-button">
              {isEditing ? 'Save Changes' : 'Create Challenge'}
            </button>
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </ScrollableContent>
    </form>
  );
};

export default ChallengeCreator;
