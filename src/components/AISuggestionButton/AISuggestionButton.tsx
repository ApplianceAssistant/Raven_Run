import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useAIAssist } from '../../hooks/useAIAssist';
import { AIAssistRequest } from '../../types/anthropic.types';
import AIPromptModal from '../AIPromptModal/AIPromptModal';
import './AISuggestionButton.scss';

interface Challenge {
  title: string;
  description: string;
  difficulty?: string;
}

interface GameSettings {
  writingStyle: string;
  gameGenre: string;
  tone: string;
  customWritingStyle?: string;
  customGameGenre?: string;
  customTone?: string;
}

interface GameObject {
  title?: string;
  description?: string;
  challenges?: Challenge[];
  tags?: string[];
  difficulty_level?: string;
  estimatedTime?: string;
  gameSettings: GameSettings;
  [key: string]: any;
}

interface AISuggestionButtonProps {
  onSelect: (suggestion: string) => void;
  className?: string;
  gameObject?: GameObject;
  onSettingsChange?: (gameObject: GameObject) => void;
  field?: string;
}

export const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({
  onSelect,
  className = '',
  gameObject,
  onSettingsChange,
  field
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSettingsChange = (updatedGameObject: GameObject) => {
    if (onSettingsChange) {
      onSettingsChange(updatedGameObject);
    }
  };

  return (
    <>
      <button 
        className={`ai-suggestion-button ${className}`}
        onClick={handleClick}
        type="button"
        title="Get AI suggestions"
      >
        <FontAwesomeIcon icon={faMagicWandSparkles} />
      </button>

      <AIPromptModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSelect={onSelect}
        gameObject={gameObject}
        onSettingsChange={handleSettingsChange}
        field={field}
      />
    </>
  );
};

export default AISuggestionButton;
