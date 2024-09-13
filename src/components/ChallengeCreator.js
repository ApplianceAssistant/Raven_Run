import React, { useState, useEffect } from 'react';
import { challengeTypeConfig } from '../config/challengeTypeConfig';
import { Challenge } from '../types/challengeTypes';
import '../css/GameCreator.scss';
import ScrollableContent from './ScrollableContent';
import ModifyChallengeModal from './ModifyChallengeModal';
import ToggleSwitch from './ToggleSwitch';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChallengeType, setNewChallengeType] = useState('');

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
    console.log(`Input changed: ${name} = ${value}`);

    if (name === 'type' && currentChallenge.type !== '' && currentChallenge.type !== value) {
      console.log(`Challenge type changing from ${currentChallenge.type} to ${value}`);
      setNewChallengeType(value);
      setIsModalOpen(true);
    } else {
      updateChallenge(name, value);
    }
  };

  const updateChallenge = (name, value) => {
    const updatedChallenge = { ...currentChallenge, [name]: value };
    console.log('Updating challenge:', updatedChallenge);
    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
  };

  const handleModalConfirm = () => {
    console.log('Creating new challenge');
    const newChallenge = {
      id: Date.now().toString(),
      type: newChallengeType,
      title: currentChallenge.title,
      description: currentChallenge.description,
    };
    setCurrentChallenge(newChallenge);
    onUpdate(newChallenge);
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    console.log('Modifying current challenge');
    const updatedChallenge = { ...currentChallenge, type: newChallengeType };
    const typeConfig = challengeTypeConfig[newChallengeType];

    Object.keys(updatedChallenge).forEach(key => {
      if (!typeConfig[key] && key !== 'id' && key !== 'type') {
        delete updatedChallenge[key];
      }
    });

    setCurrentChallenge(updatedChallenge);
    onUpdate(updatedChallenge);
    setIsModalOpen(false);
  };

  const handleArrayChange = (e, index, field) => {
    const { value } = e.target;
    const newArray = Array.isArray(currentChallenge[field]) ? [...currentChallenge[field]] : [];
    newArray[index] = value;
    updateChallenge(field, newArray);
  };

  const addArrayItem = (field) => {
    const currentArray = Array.isArray(currentChallenge[field]) ? currentChallenge[field] : [];
    updateChallenge(field, [...currentArray, '']);
  };

  const removeArrayItem = (index, field) => {
    const currentArray = Array.isArray(currentChallenge[field]) ? currentChallenge[field] : [];
    updateChallenge(field, currentArray.filter((_, i) => i !== index));
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

  const handleToggleChange = (fieldName) => {
    updateChallenge(fieldName, !currentChallenge[fieldName]);
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = currentChallenge[fieldName];

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            name={fieldName}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={fieldConfig.label}
            required={fieldConfig.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={fieldName}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={fieldConfig.label}
            required={fieldConfig.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            name={fieldName}
            value={value || 0}
            onChange={handleInputChange}
            placeholder={fieldConfig.label}
            required={fieldConfig.required}
          />
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
                label={value ? 'True' : 'One Time Only'}
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
          <div className="array-field">
            {(Array.isArray(value) ? value : []).map((item, index) => (
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
          <div className="location-field">
            <input
              type="number"
              name={`${fieldName}.latitude`}
              value={value?.latitude || 0}
              onChange={(e) => handleInputChange({ target: { name: fieldName, value: { ...value, latitude: parseFloat(e.target.value) } } })}
              placeholder="Latitude"
              required={fieldConfig.required}
            />
            <input
              type="number"
              name={`${fieldName}.longitude`}
              value={value?.longitude || 0}
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
          {currentChallenge.type && Object.entries(challengeTypeConfig[currentChallenge.type]).map(([fieldName, fieldConfig]) => (
            <div key={fieldName} className="field-container">
              <label htmlFor={fieldName}>{fieldConfig.label}:</label>
              {renderField(fieldName, fieldConfig)}
            </div>
          ))}
        </ScrollableContent>
      </form>
      <ModifyChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        title="Change Challenge Type"
        message="Do you want to create a new challenge or modify the current one?"
      />
    </div>
  );
};

export default ChallengeCreator;