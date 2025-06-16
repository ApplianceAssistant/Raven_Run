
import React from 'react';
import { StoryChoice } from '../types/GeminiCYOATypes';

interface StoryDisplayProps {
  scenario: string;
  imageUrl: string | null;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ scenario, imageUrl }) => {
  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl mb-8 border border-gray-700">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Current scene" 
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-6 shadow-lg border-2 border-purple-500"
        />
      ) : (
        <div className="w-full h-64 md:h-96 bg-gray-700 rounded-lg mb-6 flex items-center justify-center text-gray-400">
          <p>Generating image...</p>
        </div>
      )}
      <p className="text-gray-200 text-lg md:text-xl leading-relaxed whitespace-pre-line">{scenario}</p>
    </div>
  );
};

interface ChoicesListProps {
  choices: StoryChoice[];
  onChoiceSelected: (choice: StoryChoice) => void;
  disabled?: boolean;
}

export const ChoicesList: React.FC<ChoicesListProps> = ({ choices, onChoiceSelected, disabled }) => {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="mt-6 md:mt-8">
      <h3 className="text-xl md:text-2xl font-semibold text-purple-400 mb-4 text-center">What do you do next?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoiceSelected(choice)}
            disabled={disabled}
            className={`
              w-full p-4 md:p-5 text-left rounded-lg shadow-lg transition-all duration-200 ease-in-out
              bg-purple-600 hover:bg-purple-500 text-white
              focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75
              transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed
            `}
          >
            <span className="font-medium text-base md:text-lg">{choice.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
