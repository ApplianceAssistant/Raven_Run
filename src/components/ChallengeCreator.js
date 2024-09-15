import React, { useState, useEffect } from 'react';
import { challengeTypeConfig } from '../config/challengeTypeConfig';
import ToggleSwitch from './ToggleSwitch';
import { Challenge } from '../types/challengeTypes';
import '../css/GameCreator.scss';
import ScrollableContent from './ScrollableContent';
import { feetToMeters, metersToFeet, getDistanceUnit } from '../utils/unitConversion';

const ChallengeCreator = ({ challenge, onUpdate, onRequiredFieldsCheck }) => {
  const [currentChallenge, setCurrentChallenge] = useState(challenge || {
    id: Date.now().toString(),
    type: '',
    title: '',
    description: '',
    question: '',
    hints: [''],
    feedbackTexts: { correct: '', incorrect: [''] },
    options: [''],
    correctAnswer: '',
    repeatable: false,
    targetLocation: { latitude: 0, longitude: 0 },
    radius: 0,
    completionFeedback: '',
    clues: [''],
  });

  const [isMetric, setIsMetric] = useState(() => {
    const savedUnitSystem = localStorage.getItem('unitSystem');
    return savedUnitSystem ? JSON.parse(savedUnitSystem) : false;
  });

  useEffect(() => {
    if (challenge) {
      setCurrentChallenge(challenge);
    }
  }, [challenge]);

  useEffect(() => {
    checkRequiredFields();
  }, [currentChallenge]);

  const updateChallenge = (fieldName, value) => {
    const updatedChallenge = { ...currentChallenge, [fieldName]: value };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'radius') {
      // Convert radius to meters before saving
      updatedValue = value === '' ? '' : isMetric ? parseFloat(value) : feetToMeters(parseFloat(value));
    }

    const updatedChallenge = { ...currentChallenge, [name]: updatedValue };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const handleToggleChange = (fieldName) => {
    updateChallenge(fieldName, !currentChallenge[fieldName]);
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const newArray = [...currentChallenge[field]];
    newArray[index] = value;
    updateChallenge(field, newArray);
  };

  const addArrayItem = (field) => {
    updateChallenge(field, [...currentChallenge[field], '']);
  };

  const removeArrayItem = (index, field) => {
    const newArray = currentChallenge[field].filter((_, i) => i !== index);
    updateChallenge(field, newArray);
  };

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateChallenge('targetLocation', { latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please check your browser settings and try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const checkRequiredFields = () => {
    if (!currentChallenge.type) {
      onRequiredFieldsCheck(false);
      return;
    }

    const typeConfig = challengeTypeConfig[currentChallenge.type];
    const allRequiredFilled = Object.entries(typeConfig).every(([fieldName, fieldConfig]) => {
      if (fieldConfig.required) {
        const value = currentChallenge[fieldName];
        if (Array.isArray(value)) {
          return value.length > 0 && value.every(item => item.trim() !== '');
        }
        return value !== '' && value !== undefined && value !== null;
      }
      return true;
    });

    onRequiredFieldsCheck(allRequiredFilled);
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = currentChallenge[fieldName];

    if (fieldName === 'radius') {
      const displayValue = value === '' ? '' : isMetric ? value : metersToFeet(value);
      return (
        <div className="field-container">
          <input
            type="number"
            name={fieldName}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={(e) => {
              if (e.target.value === '') {
                handleInputChange({ target: { name: fieldName, value: '0' } });
              }
            }}
            placeholder={fieldConfig.label}
            required={fieldConfig.required}
            min="0"
            step="5"
          />
        </div>
      );
    }

    if (fieldName === 'targetLocation') {
      return (
        <div className="location-field field-container">
          <input
            type="number"
            name={`${fieldName}.latitude`}
            value={value.latitude}
            onChange={(e) => updateChallenge(fieldName, { ...value, latitude: parseFloat(e.target.value) })}
            placeholder="Latitude"
            required={fieldConfig.required}
          />
          <input
            type="number"
            name={`${fieldName}.longitude`}
            value={value.longitude}
            onChange={(e) => updateChallenge(fieldName, { ...value, longitude: parseFloat(e.target.value) })}
            placeholder="Longitude"
            required={fieldConfig.required}
          />
          <button type="button" onClick={handleUseMyLocation} className="use-location-button">
            Use My Location
          </button>
        </div>
      );
    }

    switch (fieldConfig.type) {
      case 'text':
        return (
          <div className="field-container">
            <input
              type="text"
              name={fieldName}
              value={value}
              onChange={handleInputChange}
              placeholder={fieldConfig.label}
              required={fieldConfig.required}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="field-container">
            <textarea
              name={fieldName}
              value={value || ''}
              onChange={handleInputChange}
              placeholder={fieldConfig.label}
              required={fieldConfig.required}
            />
          </div>
        );
      case 'number':
        return (
          <div className="field-container">
            <input
              type="number"
              name={fieldName}
              value={value || 0}
              onChange={handleInputChange}
              placeholder={fieldConfig.label}
              required={fieldConfig.required}
            />
          </div>
        );
      case 'boolean':
        if (currentChallenge.type === 'trueFalse' && fieldName === 'correctAnswer') {
          return (
            <div className="true-false-toggle">
              <ToggleSwitch
                isChecked={value || false}
                onToggle={() => handleToggleChange(fieldName)}
                label={value ? 'True' : 'False'}
              />
              <span className="toggle-label">{value ? 'True' : 'False'}</span>
            </div>
          );
        } else if (fieldName === 'repeatable') {
          return (
            <div className="repeatable-toggle">
              <ToggleSwitch
                isChecked={value || false}
                onToggle={() => handleToggleChange(fieldName)}
                label={value ? 'Repeatable' : 'One Time Only'}
              />
            </div>
          );
        }
        return (
          <ToggleSwitch
            isChecked={value || false}
            onToggle={() => handleToggleChange(fieldName)}
            label={fieldConfig.label}
          />
        );
      case 'array':
        return (
          <div className="array-field field-container">
            {value.map((item, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(e, index, fieldName)}
                  placeholder={`${fieldConfig.label} ${index + 1}`}
                />
                <button 
                  type="button" 
                  onClick={() => removeArrayItem(index, fieldName)} 
                  className="remove-button"
                  aria-label="Remove item"
                >
                  <span className="remove-icon">×</span>
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(fieldName)} className="add-button">Add {fieldConfig.label}</button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderFields = () => {
    if (!currentChallenge.type) return null;
    const typeConfig = challengeTypeConfig[currentChallenge.type];
    return (
      <div className="challenge-fields">
        {Object.entries(typeConfig).map(([fieldName, fieldConfig]) => (
          <div key={fieldName} className="field-container">
            <label htmlFor={fieldName}>
              {fieldConfig.label}
              {fieldName === 'radius' && (
                <span className="unit-indicator"> ({getDistanceUnit(isMetric)})</span>
              )}:
            </label>
            {renderField(fieldName, fieldConfig)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="challenge-creator">
      <h2>Create a Challenge</h2>
      <form>
        <div className="challenge-type-selector field-container">
          <label htmlFor="challengeType">Challenge Type:</label>
          <select
            id="challengeType"
            name="type"
            value={currentChallenge.type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a challenge type</option>
            {Object.keys(challengeTypeConfig).map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>
        <ScrollableContent maxHeight="60vh">
          {renderFields()}
        </ScrollableContent>
      </form>
    </div>
  );
};

export default ChallengeCreator;