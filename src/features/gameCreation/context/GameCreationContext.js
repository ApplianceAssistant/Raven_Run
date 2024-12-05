import React, { createContext, useContext, useReducer, useState } from 'react';

const GameCreationContext = createContext();

const initialState = {
  games: [],
  selectedGame: null,
  isLoading: false,
  error: null
};

export const GameCreationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameCreationReducer, initialState);
  
  const value = {
    ...state,
    dispatch,
  };
  
  return (
    <GameCreationContext.Provider value={value}>
      {children}
    </GameCreationContext.Provider>
  );
};

export const useGameCreation = () => {
  const context = useContext(GameCreationContext);
  if (context === undefined) {
    throw new Error('useGameCreation must be used within a GameCreationProvider');
  }
  return context;
};

export default GameCreationContext;
