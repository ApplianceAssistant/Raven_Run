import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useAIAssist } from '../../hooks/useAIAssist';
import { AIAssistRequest } from '../../types/anthropic.types';
import AIPromptModal from '../AIPromptModal/AIPromptModal';
import './AISuggestionButton.scss';

interface AISuggestionButtonProps {
  field: AIAssistRequest['field'];
  context: {
    title?: string;
    description?: string;
    difficulty_level?: string;
    tags?: string[];
    type?: string;
    feedbackType?: string;
  };
  existingContent?: string;
  onSelect: (suggestion: string) => void;
  className?: string;
}

export const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({
  field,
  context,
  existingContent,
  onSelect,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button 
        className={`ai-suggestion-button ${className}`}
        onClick={handleClick}
        title="Get AI suggestions"
      >
        <FontAwesomeIcon icon={faMagicWandSparkles} />
      </button>

      <AIPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onSelect}
        field={field}
      />
    </>
  );
};

export default AISuggestionButton;
