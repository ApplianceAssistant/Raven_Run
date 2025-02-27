import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ScrollableContent from '../ScrollableContent';
import { useMessage } from '../../utils/MessageProvider';
import { useAIAssist } from '../../hooks/useAIAssist';
import { AIAssistRequest } from '../../types/anthropic.types';
import { FIELD_RESPONSE_CONFIG, getFieldLimits } from '../../features/gameCreation/context/AIPromptContext';
import './AIPromptModal.scss';

interface MessageContextType {
  showError: (text: string) => void;
  showSuccess: (text: string) => void;
  showWarning: (text: string) => void;
  showInfo: (text: string) => void;
  clearMessage: () => void;
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
  challenges?: Array<{
    title: string;
    description: string;
    difficulty?: string;
  }>;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: string;
  gameSettings: GameSettings;
  [key: string]: any;
}

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  field?: string;
  scope?: 'game' | 'challenge';
  gameObject?: GameObject;
  onSettingsChange?: (settings: GameObject) => void;
  challengeType?: string;
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
  scope = 'game',
  gameObject,
  onSettingsChange,
  challengeType
}) => {

  const { showError, clearMessage } = useMessage() as MessageContextType;
  const { loading, error, suggestions, getSuggestions, selectSuggestion } = useAIAssist({ onSuggestionSelect: onSelect });
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isInputSectionExpanded, setIsInputSectionExpanded] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : true;
  });
  const lastSettings = useRef<any>(null);

  // Extract settings from gameSettings object
  const extractedSettings = gameObject?.gameSettings || {
    writingStyle: 'default',
    gameGenre: 'default',
    tone: 'default',
    customWritingStyle: '',
    customGameGenre: '',
    customTone: ''
  };

  // Input states
  const [writingStyle, setWritingStyle] = useState(extractedSettings.writingStyle || 'default');
  const [customWritingStyle, setCustomWritingStyle] = useState(extractedSettings.customWritingStyle || '');
  const [gameGenre, setGameGenre] = useState(extractedSettings.gameGenre || 'default');
  const [customGameGenre, setCustomGameGenre] = useState(extractedSettings.customGameGenre || '');
  const [tone, setTone] = useState(extractedSettings.tone || 'default');
  const [customTone, setCustomTone] = useState(extractedSettings.customTone || '');
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
          // Check if all settings are set and collapse input section
          if (writingStyle !== 'default' && gameGenre !== 'default' && tone !== 'default') {
            setIsInputSectionExpanded(false);
          }
        });
      });
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, writingStyle, gameGenre, tone]);

  useEffect(() => {
    if (gameObject?.gameSettings) {
      setWritingStyle(gameObject.gameSettings?.writingStyle || 'default');
      setCustomWritingStyle(gameObject.gameSettings?.customWritingStyle || '');
      setGameGenre(gameObject.gameSettings?.gameGenre || 'default');
      setCustomGameGenre(gameObject.gameSettings?.customGameGenre || '');
      setTone(gameObject.gameSettings?.tone || 'default');
      setCustomTone(gameObject.gameSettings?.customTone || '');
    }
  }, [gameObject?.gameSettings]);

  const updateSettings = (newSettings: any) => {
    if (onSettingsChange && gameObject) {
      // Convert camelCase to snake_case for storage
      const cleanSettings: GameSettings = {
        writingStyle: newSettings.writingStyle,
        gameGenre: newSettings.gameGenre,
        tone: newSettings.tone,
        customWritingStyle: newSettings.writingStyle === 'custom' ? newSettings.customWritingStyle : '',
        customGameGenre: newSettings.gameGenre === 'custom' ? newSettings.customGameGenre : '',
        customTone: newSettings.tone === 'custom' ? newSettings.customTone : ''
      };

      const currentSettings = JSON.stringify(cleanSettings);
      const prevSettings = JSON.stringify(lastSettings.current);

      if (currentSettings !== prevSettings) {
        lastSettings.current = cleanSettings;
        // Create a new game object with updated settings
        const updatedGameObject = {
          ...gameObject,
          gameSettings: cleanSettings
        };
        onSettingsChange(updatedGameObject);
      }
    }
  };

  const handleCustomWritingStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWritingStyle(e.target.value);
    updateSettings({
      writingStyle,
      gameGenre,
      tone,
      customWritingStyle: e.target.value,
      customGameGenre,
      customTone
    });
  };

  const handleCustomGameGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGameGenre(e.target.value);
    updateSettings({
      writingStyle,
      gameGenre,
      tone,
      customWritingStyle,
      customGameGenre: e.target.value,
      customTone
    });
  };

  const handleCustomToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTone(e.target.value);
    updateSettings({
      writingStyle,
      gameGenre,
      tone,
      customWritingStyle,
      customGameGenre,
      customTone: e.target.value
    });
  };

  const handleWritingStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWritingStyle(e.target.value);
    updateSettings({
      writingStyle: e.target.value,
      gameGenre,
      tone,
      customWritingStyle,
      customGameGenre,
      customTone
    });
  };

  const handleGameGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameGenre(e.target.value);
    updateSettings({
      writingStyle,
      gameGenre: e.target.value,
      tone,
      customWritingStyle,
      customGameGenre,
      customTone
    });
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTone(e.target.value);
    updateSettings({
      writingStyle,
      gameGenre,
      tone: e.target.value,
      customWritingStyle,
      customGameGenre,
      customTone
    });
  };

  const handleGetSuggestions = async () => {
    if (!field) return; // Early return if field is not provided

    // Collapse input section when generating
    setIsInputSectionExpanded(false);
    
    clearMessage();
    try {
      // Get the appropriate response expectations based on field and scope
      const getResponseExpectations = (field: string, scope: 'game' | 'challenge') => {
        const config = FIELD_RESPONSE_CONFIG[field as keyof typeof FIELD_RESPONSE_CONFIG];

        if (!config) {
          console.warn(`No response config found for field: ${field}, using defaults`);
          return {
            wordCount: { min: 3, max: 10 },
            style: 'short',
            description: 'Default response expectations'
          };
        }

        // Handle nested configurations
        if ('game' in config) {
          // Handle description field with game/story/travel types
          if (scope === 'game') {
            return config.game;
          } else if (scope === 'challenge' && challengeType) {
            const challengeConfig = config[challengeType as keyof typeof config] || config.story;
            return challengeConfig;
          }
          return config.game;
        } else if ('correct' in config) {
          // Handle feedbackTexts field with correct/incorrect types
          return {
            wordCount: config.correct.wordCount,
            style: config.correct.style,
            description: config.correct.description
          };
        } else if ('wordCount' in config) {
          // Handle simple fields
          return config;
        }

        // Fallback with warning
        console.warn(`Unexpected config structure for field: ${field}, using defaults`);
        return {
          wordCount: { min: 3, max: 10 },
          style: 'short',
          description: 'Default response expectations'
        };
      };

      const request: AIAssistRequest = {
        field: field,
        scope: scope,
        context: {
          writingStyle: writingStyle === 'custom' ? customWritingStyle : writingStyle || 'default',
          gameGenre: gameGenre === 'custom' ? customGameGenre : gameGenre || 'default',
          tone: tone === 'custom' ? customTone : tone || 'default',
          additionalContext: context,
          gameContext: {
            title: gameObject?.title || '',
            description: gameObject?.description || '',
            difficulty: gameObject?.difficulty || '',
            estimatedTime: gameObject?.estimatedTime || '',
            tags: gameObject?.tags || []
          },
          existingChallenges: gameObject?.challenges?.map(c => ({
            type: 'challenge',
            title: c.title,
            content: c.description,
            difficulty: c.difficulty || 'medium'
          })) || [],
          responseExpectations: getResponseExpectations(field, scope as 'game' | 'challenge'),
          ...getFieldLimits(field),
          scope: scope,
          challengeType: scope === 'challenge' ? challengeType : undefined
        }
      };

      await getSuggestions(request);
    } catch (error) {
      showError('Failed to get AI suggestions. Please try again.');
    }
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
          type="button"
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
                    onChange={handleWritingStyleChange}
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
                      onChange={handleCustomWritingStyleChange}
                      placeholder="Enter custom writing style"
                    />
                  )}
                </div>

                <div className="input-group">
                  <label>Game Genre</label>
                  <select
                    value={gameGenre}
                    onChange={handleGameGenreChange}
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
                      onChange={handleCustomGameGenreChange}
                      placeholder="Enter custom game genre"
                    />
                  )}
                </div>

                <div className="input-group">
                  <label>Tone</label>
                  <select
                    value={tone}
                    onChange={handleToneChange}
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
                      onChange={handleCustomToneChange}
                      placeholder="Enter custom tone"
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
                  <span>Loading suggestions...</span>
                  <FontAwesomeIcon icon={faSpinner} spin />
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
                      onClick={() => {
                        selectSuggestion(suggestion);
                        onClose();
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollableContent>
        <div className="modal-footer">
          <button
            className="generate-button"
            onClick={handleGetSuggestions}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
