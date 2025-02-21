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
    console.log('getAISuggestions called with:', request);
    console.log('Making request to:', this.baseUrl);
    
    try {
      // Log the current axios configuration
      console.log('Current axios config:', {
        baseURL: axios.defaults.baseURL,
        withCredentials: axios.defaults.withCredentials
      });
      
      const response = await axios.post<APIResponse<{ suggestions: string[] }>>(
        this.baseUrl,
        request
      );
      
      if (response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          suggestions: response.data.data.suggestions
        };
      } else {
        return {
          success: false,
          suggestions: [],
          error: response.data.message
        };
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<APIResponse<null>>;
        return {
          success: false,
          suggestions: [],
          error: axiosError.response?.data?.message || axiosError.message || 'Failed to get AI suggestions'
        };
      }

      return {
        success: false,
        suggestions: [],
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }
}

export const anthropicService = AnthropicService.getInstance();
