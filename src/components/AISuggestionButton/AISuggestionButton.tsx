import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useAIAssist } from '../../hooks/useAIAssist';
import { AIAssistRequest } from '../../types/anthropic.types';
import AIPromptModal from '../AIPromptModal/AIPromptModal';
import './AISuggestionButton.scss';

interface AISuggestionButtonProps {
  field: string;
  context?: string;
  onSelect: (suggestion: string) => void;
  className?: string;
  gameSettings?: {
    writingStyle: string;
    gameGenre: string;
    tone: string;
    customWritingStyle?: string;
    customGameGenre?: string;
    customTone?: string;
  };
  onSettingsChange?: (settings: {
    writingStyle: string;
    gameGenre: string;
    tone: string;
    customWritingStyle?: string;
    customGameGenre?: string;
    customTone?: string;
  }) => void;
}

export const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({
  field,
  context,
  onSelect,
  className = '',
  gameSettings,
  onSettingsChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
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
        onClose={() => setIsModalOpen(false)}
        onSelect={onSelect}
        field={field}
        gameSettings={gameSettings}
        onSettingsChange={onSettingsChange}
      />
    </>
  );
};

export default AISuggestionButton;
