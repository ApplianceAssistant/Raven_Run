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

interface AnthropicError {
  response?: {
    data?: {
      error?: {
        type?: string;
        message?: string;
      };
    };
  };
  message?: string;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export const useAIAssist = ({ onSuggestionSelect }: UseAIAssistProps = {}): UseAIAssistReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getSuggestionsWithRetry = async (
    request: AIAssistRequest, 
    retryCount = 0,
    delay = INITIAL_RETRY_DELAY
  ): Promise<AIAssistResponse> => {
    try {
      const response = await anthropicService.getAISuggestions(request);
      return response;
    } catch (err) {
      const error = err as AnthropicError;
      if (error.response?.data?.error?.type === 'overloaded_error' && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return getSuggestionsWithRetry(request, retryCount + 1, delay * 2);
      }
      throw error;
    }
  };

  const getSuggestions = useCallback(async (request: AIAssistRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    
    console.log('AI Request:', {
      field: request.field,
      context: request.context,
      existingContent: request.existingContent
    });
    
    try {
      const response = await getSuggestionsWithRetry(request);
      
      if (response.success) {
        setSuggestions(response.suggestions);
      } else {
        setError(response.error || 'Failed to get suggestions');
        setSuggestions([]);
      }
    } catch (err) {
      const error = err as AnthropicError;
      setError(error.message || 'An unexpected error occurred');
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
