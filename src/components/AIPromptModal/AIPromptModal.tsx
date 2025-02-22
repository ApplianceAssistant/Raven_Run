import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import ScrollableContent from '../ScrollableContent';
import MessageDisplay from '../MessageDisplay';
import { useMessage } from '../../utils/MessageProvider';
import { useAIAssist } from '../../hooks/useAIAssist';
import { MessageTypes } from '../../utils/MessageProvider';
import './AIPromptModal.scss';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  field: string;
}

const MAX_CONTEXT_LENGTH = 500;
const STORAGE_KEY = 'ai_prompt_input_section_expanded';

const WRITING_STYLES = [
  { value: 'default', label: 'Select a style...' },
  { value: 'shakespeare', label: 'Shakespeare' },
  { value: 'poe', label: 'Edgar Allan Poe' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'pirate', label: 'Pirate' },
  { value: 'custom', label: 'Custom' }
];

const GAME_GENRES = [
  { value: 'default', label: 'Select a genre...' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'educational', label: 'Educational' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'custom', label: 'Custom' }
];

const TONES = [
  { value: 'default', label: 'Select a tone...' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'professional', label: 'Professional' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'mysterious', label: 'Mysterious' },
  { value: 'custom', label: 'Custom' }
];

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  field,
}) => {
  const { showError, clearMessage } = useMessage();
  const { loading, error, suggestions, getSuggestions } = useAIAssist({ onSuggestionSelect: onSelect });
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isInputSectionExpanded, setIsInputSectionExpanded] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : true;
  });
  
  // Input states
  const [writingStyle, setWritingStyle] = useState('default');
  const [customWritingStyle, setCustomWritingStyle] = useState('');
  const [gameGenre, setGameGenre] = useState('default');
  const [customGameGenre, setCustomGameGenre] = useState('');
  const [tone, setTone] = useState('default');
  const [customTone, setCustomTone] = useState('');
  const [context, setContext] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isInputSectionExpanded));
  }, [isInputSectionExpanded]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const validateInputs = () => {
    const missingFields = [];

    if (writingStyle === 'default') {
      missingFields.push('Writing Style');
    }
    if (writingStyle === 'custom' && !customWritingStyle.trim()) {
      missingFields.push('Custom Writing Style');
    }

    if (gameGenre === 'default') {
      missingFields.push('Game Genre');
    }
    if (gameGenre === 'custom' && !customGameGenre.trim()) {
      missingFields.push('Custom Game Genre');
    }

    if (tone === 'default') {
      missingFields.push('Tone');
    }
    if (tone === 'custom' && !customTone.trim()) {
      missingFields.push('Custom Tone');
    }

    if (!context.trim()) {
      missingFields.push('Context Description');
    }

    return missingFields;
  };

  const handleGenerate = async () => {
    const missingFields = validateInputs();
    
    if (missingFields.length > 0) {
      showError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    clearMessage();
    
    const request = {
      field,
      context: {
        writingStyle: writingStyle === 'custom' ? customWritingStyle : writingStyle,
        gameGenre: gameGenre === 'custom' ? customGameGenre : gameGenre,
        tone: tone === 'custom' ? customTone : tone,
        additionalContext: context
      }
    };

    await getSuggestions(request);
  };

  if (!shouldRender) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleInputSection = () => {
    setIsInputSectionExpanded(!isInputSectionExpanded);
  };

  return (
    <div 
      className={`ai-prompt-modal-overlay ${isVisible ? 'visible' : ''}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`ai-prompt-modal ${isVisible ? 'visible' : ''}`}
      >
        <button 
          className="close-button" 
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="modal-header">
          <h2>AI Suggestions for {field}</h2>
        </div>

        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 70)">
          <div 
            className={`modal-content ${isVisible ? 'visible' : ''}`}
          >
            <div 
              className={`input-section ${isInputSectionExpanded ? 'expanded' : 'collapsed'}`}
            >
              <div 
                className="section-header" 
                onClick={toggleInputSection}
              >
                <h3>AI Style Settings</h3>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`toggle-icon ${isInputSectionExpanded ? 'rotated' : ''}`}
                />
              </div>
              
              <div className="input-grid">
                <div className="input-group">
                  <label>Writing Style</label>
                  <select 
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                  >
                    {WRITING_STYLES.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                  {writingStyle === 'custom' && (
                    <input
                      type="text"
                      value={customWritingStyle}
                      onChange={(e) => setCustomWritingStyle(e.target.value)}
                      placeholder="Enter custom style..."
                    />
                  )}
                </div>

                <div className="input-group">
                  <label>Game Genre</label>
                  <select 
                    value={gameGenre}
                    onChange={(e) => setGameGenre(e.target.value)}
                  >
                    {GAME_GENRES.map(genre => (
                      <option key={genre.value} value={genre.value}>
                        {genre.label}
                      </option>
                    ))}
                  </select>
                  {gameGenre === 'custom' && (
                    <input
                      type="text"
                      value={customGameGenre}
                      onChange={(e) => setCustomGameGenre(e.target.value)}
                      placeholder="Enter custom genre..."
                    />
                  )}
                </div>

                <div className="input-group">
                  <label>Tone</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    {TONES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {tone === 'custom' && (
                    <input
                      type="text"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      placeholder="Enter custom tone..."
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="context-input">
              <textarea
                value={context}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CONTEXT_LENGTH) {
                    setContext(e.target.value);
                  }
                }}
                placeholder="Describe what you want to create..."
              />
              <div className="character-count">
                {context.length}/{MAX_CONTEXT_LENGTH}
              </div>
            </div>

            {/* Suggestions section */}
            <div className="suggestions-section">
              {loading && (
                <div className="loading-spinner">
                  Generating suggestions...
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              {!loading && !error && suggestions.length > 0 && (
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="suggestion-item"
                      onClick={() => onSelect?.(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="generate-button"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </ScrollableContent>
        <div className="modal-footer">
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
