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
        request
      );
      
      console.log('Anthropic API response:', {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message
      });

      if (response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          suggestions: response.data.data.suggestions
        };
      } else {
        return {
          success: false,
          suggestions: [],
          error: response.data.message || 'Failed to get suggestions'
        };
      }
    } catch (err) {
      console.error('Anthropic API error:', {
        status: err.response?.status,
        error: err.response?.data?.error,
        message: err.message
      });

      const errorResponse = err.response?.data?.error;
      let errorMessage = 'An unexpected error occurred';
      
      if (errorResponse) {
        switch (errorResponse.type) {
          case 'invalid_request_error':
            errorMessage = 'There was an issue with the request format. Please try again.';
            break;
          case 'authentication_error':
            errorMessage = 'Authentication failed. Please contact support.';
            break;
          case 'permission_error':
            errorMessage = 'Permission denied. Please contact support.';
            break;
          case 'not_found_error':
            errorMessage = 'The requested AI model was not found. Please try again later.';
            break;
          case 'request_too_large':
            errorMessage = 'The request was too large. Please reduce the input size.';
            break;
          case 'rate_limit_error':
            errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
            break;
          case 'overloaded_error':
            errorMessage = 'The AI service is temporarily busy. Please try again in a moment.';
            break;
          case 'api_error':
            errorMessage = 'The AI service encountered an error. Please try again later.';
            break;
          default:
            errorMessage = errorResponse.message || 'Failed to get suggestions';
        }
      }

      return {
        success: false,
        suggestions: [],
        error: errorMessage
      };
    }
  }
}

export const anthropicService = AnthropicService.getInstance();
