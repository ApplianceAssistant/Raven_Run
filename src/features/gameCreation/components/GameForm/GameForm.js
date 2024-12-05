import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import { isValidGame } from '../../services/gameCreatorService';
import '../../../../css/GameCreator.scss';

const GameForm = ({ 
  gameData, 
  onSave, 
  onCancel,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState(gameData);
  const [allRequiredFieldsFilled, setAllRequiredFieldsFilled] = useState(false);

  useEffect(() => {
    const isValid = isValidGame(formData);
    setAllRequiredFieldsFilled(isValid);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePublicToggle = (isChecked) => {
    setFormData(prev => ({
      ...prev,
      public: isChecked
    }));
  };

  return (
    <div className="game-form">
      <div className="field-container">
        <label htmlFor="name">Game Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter game name"
          required
        />
      </div>

      <div className="field-container">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter game description"
          required
        />
      </div>

      <div className="field-container">
        <label>Public Game:</label>
        <ToggleSwitch
          checked={formData.public}
          onChange={handlePublicToggle}
        />
      </div>

      {formData.gameId && (
        <div className="field-container">
          <label>Game ID:</label>
          <span className="game-id-display">{formData.gameId}</span>
        </div>
      )}

      <div className="button-container">
        <button
          onClick={() => onSave(formData)}
          disabled={!allRequiredFieldsFilled}
          className={!allRequiredFieldsFilled ? 'disabled' : ''}
        >
          {isEditing ? 'Update Game' : 'Create Game'}
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default GameForm;
