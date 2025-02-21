import { useState, useCallback } from 'react';
import { anthropicService } from '../services/anthropicService';
import { AIAssistRequest, AIAssistResponse } from '../types/anthropic.types';

interface UseAIAssistProps {
  onSuggestionSelect?: (suggestion: string) => void;
}

interface UseAIAssistReturn {
  loading: boolean;
  error: string | null;
  suggestions: string[];
  getSuggestions: (request: AIAssistRequest) => Promise<void>;
  selectSuggestion: (suggestion: string) => void;
  clearSuggestions: () => void;
}

export const useAIAssist = ({ onSuggestionSelect }: UseAIAssistProps = {}): UseAIAssistReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getSuggestions = useCallback(async (request: AIAssistRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AIAssistResponse = await anthropicService.getAISuggestions(request);
      
      if (response.success) {
        setSuggestions(response.suggestions);
      } else {
        setError(response.error || 'Failed to get suggestions');
        setSuggestions([]);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectSuggestion = useCallback((suggestion: string): void => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setSuggestions([]);
  }, [onSuggestionSelect]);

  const clearSuggestions = useCallback((): void => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    suggestions,
    getSuggestions,
    selectSuggestion,
    clearSuggestions,
  };
};
