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
  title?: string;
  description?: string;
  difficulty_level?: string;
  tags?: string[];
}

export interface AIAssistRequest {
  field: 'title' | 'description' | 'hints' | 'feedback' | 'question' | 'tags';
  context: GameContext;
  existingContent?: string;
}

export interface AIAssistResponse {
  success: boolean;
  suggestions: string[];
  error?: string;
}
