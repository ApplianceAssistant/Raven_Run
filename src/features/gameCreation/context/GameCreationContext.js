/**
 * @typedef {import('../../../types/games').Game} Game
 * @typedef {import('../../../types/challengeTypes').Challenge} Challenge
 */

import React, { createContext, useContext, useReducer } from 'react';
import { gameCreationReducer } from './gameCreationReducer';

const GameCreationContext = createContext();

const initialState = {
  games: [],
  selectedGame: null,
  isLoading: false,
  error: null
};

export const GameCreationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameCreationReducer, initialState);
  
  // Provide both state and dispatch in the value
  const contextValue = {
    state,
    dispatch
  };
  
  return (
    <GameCreationContext.Provider value={contextValue}>
      {children}
    </GameCreationContext.Provider>
  );
};

export const useGameCreation = () => {
  const context = useContext(GameCreationContext);
  if (!context) {
    throw new Error('useGameCreation must be used within a GameCreationProvider');
  }
  return context;
};

export default GameCreationContext;
