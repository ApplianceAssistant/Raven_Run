export interface AnthropicResponse {
  completion: string;
  stop_reason: string;
  model: string;
}

export interface AIAssistOptions {
  gameContext?: GameContext;
  challengeType?: string;
  existingContent?: string;
  temperature?: number;
}

export interface GameContext {
  style: {
    writing: string;
    genre: string;
    tone: string;
  };
  gameState: {
    title?: string;
    description?: string;
    additionalContext?: string;
  };
}

export interface AIAssistRequest {
  field: string;
  context: {
    writingStyle?: string;
    gameGenre?: string;
    tone?: string;
    additionalContext?: string;
    gameContext?: {
      title?: string;
      description?: string;
    };
    existingChallenges?: Array<{
      type: string;
      title: string;
      content: string;
    }>;
    challengeType?: string;
    responseExpectations?: {
      wordCount: { min: number; max: number };
      style: string;
      description: string;
    };
  };
  existingContent?: string;
}

export interface AIAssistResponse {
  success: boolean;
  suggestions: string[];
  error?: string;
}

export interface AIPromptFormat {
  response_type: 'json';
  structure: 'array';
  fields: string[];
}

export interface AIPromptRequest {
  instruction: string;
  parameters: {
    style: GameContext['style'];
    gameState: GameContext['gameState'];
    request: {
      type: 'shortList' | 'mediumList' | 'longForm';
      field: string;
      count: number;
    };
  };
  format: AIPromptFormat;
}

export interface AISuggestion {
  content: string;
  reasoning: string;
  thematic_links?: string[];
}
