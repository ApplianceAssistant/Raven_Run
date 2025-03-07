export const gameCreationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GAMES':
      return {
        ...state,
        games: action.payload,
        isLoading: false
      };
    case 'SELECT_GAME':
      return {
        ...state,
        selectedGame: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};
