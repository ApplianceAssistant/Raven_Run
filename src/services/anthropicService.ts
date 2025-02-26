import { AIAssistRequest, AIAssistResponse } from '../types/anthropic.types';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../utils/utils';

interface APIResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message: string;
}

class AnthropicService {
  private static instance: AnthropicService;
  private baseUrl: string;

  private constructor() {
    // Use PHP endpoint like other API endpoints
    this.baseUrl = `${API_URL}/server/api/ai/ai.php`;
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  public async getAISuggestions(request: AIAssistRequest): Promise<AIAssistResponse> {
    console.log('Making Anthropic API request:', {
      url: this.baseUrl,
      request
    });
    
    try {
      const response = await axios.post<APIResponse<{ suggestions: string[] }>>(
        this.baseUrl,
        {
          field: request.field,
          context: {
            writingStyle: request.context.writingStyle,
            gameGenre: request.context.gameGenre,
            tone: request.context.tone,
            additionalContext: request.context.additionalContext,
            gameContext: request.context.gameContext || {},
            challengeType: request.context.challengeType,
            existingChallenges: request.context.existingChallenges || [],
            responseExpectations: request.context.responseExpectations
          },
          existingContent: request.existingContent
        }
      );
      
      console.log('Anthropic API response:', response.data);

      if (response.data.status === 'success' && Array.isArray(response.data.data?.suggestions)) {
        return {
          success: true,
          suggestions: response.data.data.suggestions
        };
      }
      
      // If we get here, the response wasn't successful or didn't have suggestions
      throw new Error(response.data.message || 'Failed to get suggestions');
    } catch (error) {
      console.error('Error in getAISuggestions:', error);
      
      // Handle axios error responses
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        return {
          success: false,
          suggestions: [],
          error: error.response.data.message
        };
      }
      
      // Handle other errors
      return {
        success: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}

export const anthropicService = AnthropicService.getInstance();
