import React, { useState, useEffect, useCallback } from 'react';
import { GameService } from '../services/GeminiCYOAService';
import { StoryResponseFormat, StoryChoice, GameState, AdventureTheme, THEME_DETAILS } from '../types/GeminiCYOATypes';
import '../css/CYOA.scss';

// --- UI Components (previously in GeminiCYOAInterface.tsx) ---

interface StoryDisplayProps {
  scenario: string;
  imageUrl: string | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ scenario, imageUrl }) => {
  return (
    <div className="cyoa__story-display">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Current scene" 
          className="cyoa__story-image"
        />
      ) : (
        <div className="cyoa__story-image--placeholder">
          <p>Generating image...</p>
        </div>
      )}
      <p className="cyoa__story-scenario">{scenario}</p>
    </div>
  );
};

interface ChoicesListProps {
  choices: StoryChoice[];
  onChoiceSelected: (choice: StoryChoice) => void;
  disabled?: boolean;
}

const ChoicesList: React.FC<ChoicesListProps> = ({ choices, onChoiceSelected, disabled }) => {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="cyoa__choices-list">
      <h3 className="cyoa__choices-title">What do you do next?</h3>
      <div className="cyoa__choices-grid">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoiceSelected(choice)}
            disabled={disabled}
            className="cyoa__choice-button"
          >
            <span>{choice.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};


// --- Main Feature Component (previously GeminiCYOAApp.tsx) ---

const GeminiCYOA: React.FC = () => {
  const [gameService, setGameService] = useState<GameService | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [currentStory, setCurrentStory] = useState<StoryResponseFormat | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<AdventureTheme | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setGameService(new GameService());
    } catch (e: any) {
      const errorMsg = e.message || "Failed to initialize Game Service. API Key might be missing.";
      setApiKeyError(errorMsg);
      setGameState('error');
      setErrorMessage(errorMsg);
    }
  }, []);

  const handleStartGame = useCallback(async (theme: AdventureTheme) => {
    if (!gameService) return;
    setIsLoading(true);
    setErrorMessage(null);
    setGameState('loading');
    setSelectedTheme(theme);
    setCurrentStory(null);
    setCurrentImage(null);

    try {
      const initialStory = await gameService.startGame(theme);
      setCurrentStory(initialStory);
      setGameState('playing');
      if (initialStory.imagePrompt) {
        const imageUrl = await gameService.generateImage(initialStory.imagePrompt);
        setCurrentImage(imageUrl);
      }
    } catch (error: any) {
      console.error("Error starting game:", error);
      setErrorMessage(error.message || "Failed to start the adventure. The spirits are uncooperative.");
      setGameState('error');
    } finally {
      setIsLoading(false);
    }
  }, [gameService]);

  const handleMakeChoice = useCallback(async (choice: StoryChoice) => {
    if (!gameService || !currentStory || !selectedTheme) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    setGameState('loading');

    try {
      const nextStory = await gameService.progressStory(currentStory.scenario, choice.text, selectedTheme);
      setCurrentStory(nextStory);
      
      if (nextStory.choices.length === 0 || nextStory.conclusion) {
        setGameState('ended');
      } else {
        setGameState('playing');
      }

      if (nextStory.imagePrompt) {
        setCurrentImage(null);
        const imageUrl = await gameService.generateImage(nextStory.imagePrompt);
        setCurrentImage(imageUrl);
      }
    } catch (error: any) {
      console.error("Error progressing story:", error);
      setErrorMessage(error.message || "The path ahead is unclear. An unexpected event occurred.");
      setGameState('error');
    } finally {
      setIsLoading(false);
    }
  }, [gameService, currentStory, selectedTheme]);

  const handleRestart = () => {
    setGameState('welcome');
    setCurrentStory(null);
    setCurrentImage(null);
    setSelectedTheme(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const LoadingSpinner: React.FC = () => (
    <div className="cyoa__loading-spinner">
      <div className="cyoa__loading-spinner-icon"></div>
      <p>The story unfolds...</p>
    </div>
  );

  const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="cyoa__error-display">
      <h3>Error</h3>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry} className="cyoa__button--primary">Retry</button>}
    </div>
  );

  const ThemeSelector: React.FC = () => (
    <div className="cyoa__theme-selector">
      <h2>Choose Your Adventure</h2>
      <div className="cyoa__theme-grid">
        {Object.entries(THEME_DETAILS).map(([themeKey, themeValue]) => (
          <button 
            key={themeKey} 
            onClick={() => handleStartGame(themeKey as AdventureTheme)}
            className="cyoa__theme-button"
          >
            <span>{themeValue.name}</span>
            <span className="cyoa__theme-button-key">{themeKey as AdventureTheme}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (apiKeyError && gameState === 'error') {
    return (
      <div className="cyoa__container cyoa__container--error">
        <h3>Configuration Error</h3>
        <p>{apiKeyError}</p>
        <p>Please ensure the API_KEY environment variable is correctly set.</p>
      </div>
    );
  }

  return (
    <div className="cyoa__container">
      {isLoading && <LoadingSpinner />}

      <main className="cyoa__main-content">
        {gameState === 'welcome' && <ThemeSelector />}
        
        {gameState === 'error' && errorMessage && (
          <ErrorDisplay message={errorMessage} />
        )}

        {(gameState === 'playing' || gameState === 'ended' || (gameState === 'loading' && currentStory)) && currentStory && (
          <>
            <StoryDisplay scenario={currentStory.scenario} imageUrl={currentImage} />
            {gameState === 'playing' && currentStory.choices && currentStory.choices.length > 0 && (
              <ChoicesList choices={currentStory.choices} onChoiceSelected={handleMakeChoice} disabled={isLoading} />
            )}
            {gameState === 'ended' && currentStory.conclusion && (
              <div className="cyoa__conclusion">
                <h3>Adventure Concluded</h3>
                <p>{currentStory.conclusion}</p>
                <button onClick={handleRestart} className="cyoa__button--primary">Play Again?</button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="cyoa__footer">
        {gameState !== 'welcome' && (
           <button onClick={handleRestart} className="cyoa__button--secondary">Restart with New Theme</button>
        )}
        <p>Powered by Google Gemini. Adventure awaits.</p>
      </footer>
    </div>
  );
};

export default GeminiCYOA;
