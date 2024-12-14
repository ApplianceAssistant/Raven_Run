import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { challengeTypeConfig } from '../../../../config/challengeTypeConfig';
import ScrollableContent from './ScrollableContent';
import '../../../../css/GameCreator.scss';

const ChallengeCreator = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [challenge, setChallenge] = useState({
    id: Date.now().toString(),
    title: '',
    description: '',
    points: 0,
    type: 'story',
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

  const handleBack = () => {
    navigate(`/create/challenges/${gameId}`);
  };

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setChallenge(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
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
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e, index, fieldName) => {
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
    setChallenge(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement challenge creation logic
    navigate(`/create/challenges/${gameId}`);
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = challenge[fieldName];

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleInputChange}
            required={fieldConfig.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleInputChange}
            required={fieldConfig.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={fieldName}
            name={fieldName}
            value={value}
            onChange={handleInputChange}
            min="0"
            step={fieldName === 'radius' ? '1' : 'any'}
            required={fieldConfig.required}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            id={fieldName}
            name={fieldName}
            checked={value}
            onChange={handleInputChange}
          />
        );
      case 'array':
        return (
          <div className="array-field">
            {value.map((item, index) => (
              <div key={index} className="array-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(e, index, fieldName)}
                  required={fieldConfig.required}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(index, fieldName)}
                  disabled={value.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem(fieldName)}>
              Add {fieldConfig.label}
            </button>
          </div>
        );
      case 'location':
        return (
          <div className="location-field">
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
        );
      default:
        return null;
    }
  };

  const typeConfig = challengeTypeConfig[challenge.type] || {};

  return (
    <>
      <button className="back-button" onClick={handleBack} title="Back to Challenges">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <div className="challenge-creator">
        <h2>Create New Challenge</h2>
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
              {Object.keys(challengeTypeConfig).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              name="points"
              value={challenge.points}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>

          {Object.entries(typeConfig).map(([fieldName, fieldConfig]) => (
            <div key={fieldName} className="form-group">
              <label htmlFor={fieldName}>{fieldConfig.label}</label>
              {renderField(fieldName, fieldConfig)}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Create Challenge
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChallengeCreator;
