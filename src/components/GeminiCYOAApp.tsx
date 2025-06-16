
import React, { useState, useEffect, useCallback } from 'react';
import { GameService } from '../services/GeminiCYOAService';
import { StoryResponseFormat, StoryChoice, GameState, AdventureTheme, THEME_DETAILS } from '../types/GeminiCYOATypes';
import { StoryDisplay, ChoicesList } from './GeminiCYOAInterface';

const App: React.FC = () => {
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
      setApiKeyError(e.message || "Failed to initialize Game Service. API Key might be missing.");
      setGameState('error');
      setErrorMessage(e.message || "Failed to initialize Game Service. API Key might be missing.");
    }
  }, []);

  const handleStartGame = useCallback(async (theme: AdventureTheme) => {
    if (!gameService) return;
    setIsLoading(true);
    setErrorMessage(null);
    setGameState('loading');
    setSelectedTheme(theme);
    setCurrentStory(null); // Clear previous story
    setCurrentImage(null); // Clear previous image

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
    // Keep current image for a bit, or clear it
    // setCurrentImage(null); 

    try {
      const nextStory = await gameService.progressStory(currentStory.scenario, choice.text, selectedTheme);
      setCurrentStory(nextStory);
      
      if (nextStory.choices.length === 0 || nextStory.conclusion) {
        setGameState('ended');
      } else {
        setGameState('playing');
      }

      if (nextStory.imagePrompt) {
        setCurrentImage(null); // Clear old image before loading new one
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 md:h-24 md:w-24 border-t-4 border-b-4 border-purple-500"></div>
      <p className="text-white text-xl md:text-2xl mt-6">The story unfolds...</p>
    </div>
  );

  const ErrorDisplay: React.FC<{ message: string | null; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-800 bg-opacity-90 p-6 md:p-8 rounded-xl shadow-2xl text-center text-white border border-red-600">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">An Obstacle!</h2>
      <p className="text-lg md:text-xl mb-6">{message || "An unknown error occurred."}</p>
      {onRetry && (
         <button 
         onClick={onRetry}
         className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 transform hover:scale-105"
       >
         Retry Last Action
       </button>
      )}
      <button 
        onClick={handleRestart}
        className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 transform hover:scale-105"
      >
        Restart Adventure
      </button>
    </div>
  );
  
  const ThemeSelector: React.FC = () => (
    <div className="w-full max-w-3xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-purple-400">Choose Your Path</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Object.entries(THEME_DETAILS).map(([themeKey, themeValue]) => (
          <button
            key={themeKey}
            onClick={() => handleStartGame(themeKey as AdventureTheme)}
            className="bg-gray-800 hover:bg-purple-700 border-2 border-purple-600 hover:border-purple-400 text-gray-200 hover:text-white font-semibold py-6 px-4 rounded-xl shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <span className="text-lg md:text-xl block">{themeValue.name}</span>
            <span className="text-xs text-purple-300 block mt-1">{themeKey as AdventureTheme}</span>
          </button>
        ))}
      </div>
    </div>
  );


  if (apiKeyError && gameState === 'error') { // Prioritize API key error message
    return (
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h1>Configuration Error</h1>
        <p>{apiKeyError}</p>
        <p>Please ensure the API_KEY environment variable is correctly set and accessible.</p>
      </div>
    );
  }

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      
      <header>
        <h1>
          Gemini Text Adventure
        </h1>
      </header>

      <main>
        {gameState === 'welcome' && <ThemeSelector />}
        
        {gameState === 'error' && errorMessage && (
          <ErrorDisplay 
            message={errorMessage} 
            onRetry={
              (currentStory && selectedTheme && !currentStory.conclusion) // Only allow retry if mid-game
              ? () => handleMakeChoice(currentStory.choices[0]) // Dummy retry, ideally track last action
              : undefined
            }
          />
        )}

        {(gameState === 'playing' || gameState === 'ended' || (gameState === 'loading' && currentStory)) && currentStory && (
          <>
            <StoryDisplay scenario={currentStory.scenario} imageUrl={currentImage} />
            {gameState === 'playing' && currentStory.choices && currentStory.choices.length > 0 && (
              <ChoicesList choices={currentStory.choices} onChoiceSelected={handleMakeChoice} disabled={isLoading} />
            )}
            {gameState === 'ended' && currentStory.conclusion && (
              <div>
                <h3>Adventure Concluded</h3>
                <p>{currentStory.conclusion}</p>
                <button 
                  onClick={handleRestart}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150 transform hover:scale-105"
                >
                  Play Again?
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        {gameState !== 'welcome' && (
           <button 
            onClick={handleRestart}>
            Restart with New Theme
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;
