import React, { useState, useEffect } from 'react';
import { challengeTypeConfig } from '../config/challengeTypeConfig';
import { Challenge } from '../types/challengeTypes';
import '../css/GameCreator.scss';
import ScrollableContent from './ScrollableContent';

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

  useEffect(() => {
    if (challenge) {
      setCurrentChallenge(challenge);
    }
  }, [challenge]);

  useEffect(() => {
    checkRequiredFields();
  }, [currentChallenge]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedChallenge = { ...currentChallenge, [name]: value };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const newArray = [...currentChallenge[field]];
    newArray[index] = value;
    const updatedChallenge = { ...currentChallenge, [field]: newArray };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const addArrayItem = (field) => {
    const updatedChallenge = {
      ...currentChallenge,
      [field]: [...currentChallenge[field], '']
    };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const removeArrayItem = (index, field) => {
    const updatedChallenge = {
      ...currentChallenge,
      [field]: currentChallenge[field].filter((_, i) => i !== index)
    };
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
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
              value={value}
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
              value={value}
              onChange={handleInputChange}
              placeholder={fieldConfig.label}
              required={fieldConfig.required}
            />
          </div>
        );
      case 'boolean':
        return (
          <div className="field-container">
            <input
              type="checkbox"
              name={fieldName}
              checked={value}
              onChange={(e) => handleInputChange({ target: { name: fieldName, value: e.target.checked } })}
            />
            {fieldConfig.label}
          </div>
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
                <button type="button" onClick={() => removeArrayItem(index, fieldName)} className="remove-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(fieldName)} className="add-button">Add {fieldConfig.label}</button>
          </div>
        );
      case 'location':
        return (
          <div className="location-field field-container">
            <input
              type="number"
              name={`${fieldName}.latitude`}
              value={value.latitude}
              onChange={(e) => handleInputChange({ target: { name: fieldName, value: { ...value, latitude: parseFloat(e.target.value) } } })}
              placeholder="Latitude"
              required={fieldConfig.required}
            />
            <input
              type="number"
              name={`${fieldName}.longitude`}
              value={value.longitude}
              onChange={(e) => handleInputChange({ target: { name: fieldName, value: { ...value, longitude: parseFloat(e.target.value) } } })}
              placeholder="Longitude"
              required={fieldConfig.required}
            />
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
            <label htmlFor={fieldName}>{fieldConfig.label}:</label>
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