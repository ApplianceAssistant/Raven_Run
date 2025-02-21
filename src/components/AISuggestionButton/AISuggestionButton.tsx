import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagicWandSparkles, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAIAssist } from '../../hooks/useAIAssist';
import { AIAssistRequest } from '../../types/anthropic.types';
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
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const {
    loading,
    error,
    suggestions,
    getSuggestions,
    selectSuggestion,
    clearSuggestions,
  } = useAIAssist({
    onSuggestionSelect: (suggestion: string) => {
      onSelect(suggestion);
      setShowSuggestions(false);
    },
  });

  const handleClick = async (): Promise<void> => {
    if (!showSuggestions) {
      setShowSuggestions(true);
      await getSuggestions({ field, context, existingContent });
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  return (
    <div className={`ai-suggestion-container ${className}`}>
      <button
        className={`ai-suggestion-button ${showSuggestions ? 'active' : ''}`}
        onClick={handleClick}
        title="Get AI suggestions"
        type="button"
      >
        <FontAwesomeIcon icon={showSuggestions ? faTimes : faMagicWandSparkles} />
      </button>

      {showSuggestions && (
        <div className="ai-suggestions-dropdown">
          {loading && <div className="ai-suggestion-loading">Loading suggestions...</div>}
          {error && <div className="ai-suggestion-error">{error}</div>}
          {!loading && !error && suggestions.length > 0 && (
            <ul className="ai-suggestion-list">
              {suggestions.map((suggestion: string, index: number) => (
                <li
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="ai-suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
