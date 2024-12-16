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

const ChallengeCreator = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { showError, showSuccess, showWarning, clearMessage } = useMessage();
  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });
  
  const [challenge, setChallenge] = useState({
    id: Date.now().toString(),
    title: '',
    description: '',
    points: 0,
    type: '',
    question: '',
    hints: [''],
    feedbackTexts: { correct: '', incorrect: [''] },
    options: [''],
    correctAnswer: '',
    repeatable: false,
    targetLocation: { latitude: 0, longitude: 0 },
    radius: 0,
    completionFeedback: '',
  });

  const [showHints, setShowHints] = useState(false);

  const handleBack = () => {
    navigate(`/create/challenges/${gameId}`);
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    clearMessage();

    let updatedValue = value;
    if (name === 'radius') {
      updatedValue = value === '' ? '' : isMetric ? parseFloat(value) : feetToMeters(parseFloat(value));
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setChallenge(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: updatedValue
        }
      }));
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

  const handleFeedbackChange = (e, type, index) => {
    const value = e.target.value;
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

  const addIncorrectFeedback = () => {
    setChallenge(prev => ({
      ...prev,
      feedbackTexts: {
        ...prev.feedbackTexts,
        incorrect: [...prev.feedbackTexts.incorrect, '']
      }
    }));
  };

  const removeIncorrectFeedback = (index) => {
    setChallenge(prev => {
      const newIncorrect = [...prev.feedbackTexts.incorrect];
      newIncorrect.splice(index, 1);
      return {
        ...prev,
        feedbackTexts: {
          ...prev.feedbackTexts,
          incorrect: newIncorrect
        }
      };
    });
  };

  const handleArrayChange = (e, index, fieldName) => {
    clearMessage();
    const { value } = e.target;
    setChallenge(prev => {
      const newArray = [...prev[fieldName]];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray
      };
    });
  };

  const addArrayItem = (fieldName) => {
    setChallenge(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  const removeArrayItem = (index, fieldName) => {
    const fieldConfig = challengeTypeConfig[challenge.type][fieldName];
    if (fieldConfig.required && challenge[fieldName].length === 1) {
      showWarning(`At least one ${fieldConfig.label || fieldName} is required`);
      return;
    }
    setChallenge(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
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
    setChallenge(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const checkRequiredFields = () => {
    if (!challenge.type) {
      showError("Challenge type is required");
      return false;
    }

    const typeConfig = challengeTypeConfig[challenge.type];
    const missingFields = [];

    Object.entries(typeConfig).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.required) {
        const value = challenge[fieldName];
        if (Array.isArray(value)) {
          if (value.length === 0 || value.some(item => item.trim() === '')) {
            missingFields.push(fieldConfig.label || fieldName);
          }
        } else if (value === '' || value === undefined || value === null) {
          missingFields.push(fieldConfig.label || fieldName);
        }
      }
    });

    if (missingFields.length > 0) {
      showError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkRequiredFields()) {
      return;
    }
    
    try {
      // TODO: Implement challenge creation logic
      showSuccess("Challenge created successfully!");
      navigate(`/create/challenges/${gameId}`);
    } catch (error) {
      showError("Failed to create challenge. Please try again.");
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = challenge[fieldName];

    // Don't render hints field unless showHints is true
    if (fieldName === 'hints' && !showHints) {
      return null;
    }

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
            <div className="feedback-field">
              <div className="feedback-section">
                <div className="field-header">
                  <label>Correct Answer Feedback</label>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => {
                      if (!value.correct) {
                        setChallenge(prev => ({
                          ...prev,
                          feedbackTexts: {
                            ...prev.feedbackTexts,
                            correct: ''
                          }
                        }));
                      }
                    }}
                    title="Add correct feedback"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </button>
                </div>
                {value.correct !== undefined && (
                  <div className="feedback-item">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => {
                        setChallenge(prev => ({
                          ...prev,
                          feedbackTexts: {
                            ...prev.feedbackTexts,
                            correct: undefined
                          }
                        }));
                      }}
                      title="Remove correct feedback"
                    >
                      <FontAwesomeIcon icon={faBan} />
                    </button>
                    <textarea
                      value={value.correct || ''}
                      onChange={(e) => handleFeedbackChange(e, 'correct')}
                      required={fieldConfig.required}
                      placeholder="Enter feedback for correct answers"
                    />
                  </div>
                )}
              </div>

              <div className="feedback-section">
                <div className="field-header">
                  <label>Incorrect Answer Feedback</label>
                  <button
                    type="button"
                    className="btn-add"
                    onClick={addIncorrectFeedback}
                    title="Add incorrect feedback"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </button>
                </div>
                {value.incorrect.map((feedback, index) => (
                  <div key={index} className="feedback-item">
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeIncorrectFeedback(index)}
                      title="Remove incorrect feedback"
                    >
                      <FontAwesomeIcon icon={faBan} />
                    </button>
                    <textarea
                      value={feedback}
                      onChange={(e) => handleFeedbackChange(e, 'incorrect', index)}
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
        return (
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={fieldName === 'radius' ? (isMetric ? value : metersToFeet(value)) : value}
            onChange={handleInputChange}
            min="0"
            step={fieldName === 'radius' ? '1' : 'any'}
            onBlur={() => {
              if (value === '' && fieldConfig.required) {
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
                  value={value.latitude}
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
                  value={value.longitude}
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
          <div className="feedback-field">
            <div className="feedback-section">
              <div className="field-header">
                <label>Correct Answer Feedback</label>
                <button
                  type="button"
                  className="btn-add"
                  onClick={() => {
                    if (!value.correct) {
                      setChallenge(prev => ({
                        ...prev,
                        feedbackTexts: {
                          ...prev.feedbackTexts,
                          correct: ''
                        }
                      }));
                    }
                  }}
                  title="Add correct feedback"
                >
                  <FontAwesomeIcon icon={faPlusCircle} />
                </button>
              </div>
              {value.correct !== undefined && (
                <div className="feedback-item">
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setChallenge(prev => ({
                        ...prev,
                        feedbackTexts: {
                          ...prev.feedbackTexts,
                          correct: undefined
                        }
                      }));
                    }}
                    title="Remove correct feedback"
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                  <textarea
                    value={value.correct || ''}
                    onChange={(e) => handleFeedbackChange(e, 'correct')}
                    required={fieldConfig.required}
                    placeholder="Enter feedback for correct answers"
                  />
                </div>
              )}
            </div>

            <div className="feedback-section">
              <div className="field-header">
                <label>Incorrect Answer Feedback</label>
                <button
                  type="button"
                  className="btn-add"
                  onClick={addIncorrectFeedback}
                  title="Add incorrect feedback"
                >
                  <FontAwesomeIcon icon={faPlusCircle} />
                </button>
              </div>
              {value.incorrect.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeIncorrectFeedback(index)}
                    title="Remove incorrect feedback"
                  >
                    <FontAwesomeIcon icon={faBan} />
                  </button>
                  <textarea
                    value={feedback}
                    onChange={(e) => handleFeedbackChange(e, 'incorrect', index)}
                    required={fieldConfig.required}
                    placeholder="Enter feedback for incorrect answers"
                  />
                </div>
              ))}
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
      return (
        <div key={fieldName} className="form-group">
          <div className="field-header">
            <label htmlFor={fieldName}>
              {fieldConfig.label || fieldName}
              {fieldName === 'radius' && ` (in ${isMetric ? 'meters' : 'feet'})`}
              {fieldConfig.required && <span className="required">*</span>}
            </label>
            {fieldName === 'hints' && (
              <button
                type="button"
                className="btn-add"
                onClick={() => {
                  setShowHints(true);
                  if (challenge.hints.length === 0) {
                    setChallenge(prev => ({
                      ...prev,
                      hints: ['']
                    }));
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
    <>
      <button className="back-button" onClick={handleBack} title="Back to Challenges">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <ScrollableContent maxHeight="80vh">
        <form onSubmit={handleSubmit} className="challenge-form">
          <div className="form-group">
            <label htmlFor="type">Challenge Type</label>
            <select
              id="type"
              name="type"
              value={challenge.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose Challenge Type</option>
              {Object.entries(challengeTypeConfig).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label || type}
                </option>
              ))}
            </select>
          </div>

          {challenge.type && (
            <>
              {renderFields()}

              <div className="button-container">
                <button type="submit" className="primary-button">
                  Create Challenge
                </button>
              </div>
            </>
          )}
        </form>
      </ScrollableContent>
    </>
  );
};

export default ChallengeCreator;
