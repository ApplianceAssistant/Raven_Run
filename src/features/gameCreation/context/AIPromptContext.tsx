import { Challenge } from '../../../types/challengeTypes';

// Define response expectations for different field types
export const FIELD_RESPONSE_CONFIG = {
  title: {
    wordCount: { min: 3, max: 6 },
    style: 'short',
    description: 'Brief, engaging title'
  },
  description: {
    game: {
      wordCount: { min: 150, max: 300 },
      style: 'long',
      description: 'Brief, engaging description for the game'
    },
    story: {
      wordCount: { min: 150, max: 300 },
      style: 'long',
      description: 'Two to three paragraphs that set mood and tell a story'
    },
    travel: {
      wordCount: { min: 100, max: 200 },
      style: 'medium',
      description: 'Detailed location clue that may include riddles or descriptive text'
    }
  },
  question: {
    wordCount: { min: 10, max: 30 },
    style: 'short',
    description: 'Clear, concise question text'
  },
  hints: {
    wordCount: { min: 5, max: 15 },
    count: { min: 1, max: 3 },
    style: 'short',
    description: 'Progressive hints that guide without giving away the answer'
  },
  feedbackTexts: {
    correct: {
      wordCount: { min: 5, max: 20 },
      style: 'short',
      description: 'Encouraging feedback for correct answers'
    },
    incorrect: {
      wordCount: { min: 5, max: 15 },
      count: { min: 1, max: 3 },
      style: 'short',
      description: 'Helpful feedback for incorrect answers'
    }
  },
  completionFeedback: {
    wordCount: { min: 20, max: 50 },
    style: 'medium',
    description: 'Rewarding feedback upon reaching the location'
  }
};

export interface CompactChallenge {
  id: string;
  type: Challenge['type'];
  title: string;
  content: string; // description or question
  order: number;
  key_elements?: {
    location?: {
      latitude: number;
      longitude: number;
      displayName?: string;
    };
    hints?: string[];
    feedbackTexts?: {
      correct: string;
      incorrect: string[];
    };
    correctAnswer?: string | boolean;
    options?: string[];
    completionFeedback?: string;
  };
}

export interface AIPromptContext {
  field: string;
  challengeType: Challenge['type'];
  gameContext: {
    title?: string;
    description?: string;
    genre?: string;
    writingStyle?: string;
    tone?: string;
  };
  existingChallenges: CompactChallenge[];
  creatorInput?: string;
  responseExpectations?: {
    wordCount: { min: number; max: number };
    style: string;
    description: string;
  };
}

export function compactifyChallenge(challenge: Challenge): CompactChallenge {
  const key_elements: any = {};

  if (challenge.type === 'travel' && challenge.targetLocation) {
    key_elements.location = {
      latitude: challenge.targetLocation.latitude,
      longitude: challenge.targetLocation.longitude,
      displayName: challenge.title
    };
    if (challenge.completionFeedback) {
      key_elements.completionFeedback = challenge.completionFeedback;
    }
  }

  if (challenge.hints) {
    key_elements.hints = challenge.hints;
  }

  if (challenge.feedbackTexts) {
    key_elements.feedbackTexts = challenge.feedbackTexts;
  }

  if (challenge.type === 'multipleChoice' || challenge.type === 'trueFalse' || challenge.type === 'textInput') {
    key_elements.correctAnswer = challenge.type === 'trueFalse' 
      ? Boolean(challenge.correctAnswer)
      : challenge.correctAnswer;
  }

  if (challenge.type === 'multipleChoice' && challenge.options) {
    key_elements.options = challenge.options;
  }

  return {
    id: challenge.id,
    type: challenge.type,
    title: challenge.title,
    content: challenge.type === 'story' || challenge.type === 'travel' 
      ? challenge.description ?? ''
      : challenge.question ?? '',
    order: challenge.order,
    key_elements
  };
}

export function buildAIPromptContext(
  field: string,
  challengeType: Challenge['type'],
  gameContext: AIPromptContext['gameContext'],
  allChallenges: Challenge[],
  currentChallengeId: string | undefined,
  creatorInput?: string
): AIPromptContext {
  // Get last 3 challenges for context
  const sortedChallenges = [...allChallenges]
    .sort((a, b) => a.order - b.order)
    .slice(-3)
    .map(compactifyChallenge);

  // Get field-specific response configuration
  const responseConfig = getResponseConfig(field, challengeType);

  // Format the response config based on field type
  let formattedResponseConfig;
  
  if (field === 'description' && (challengeType === 'story' || challengeType === 'travel')) {
    const config = responseConfig as typeof FIELD_RESPONSE_CONFIG['description'][typeof challengeType];
    formattedResponseConfig = config;
  } else if (field === 'feedbackTexts') {
    const config = responseConfig as typeof FIELD_RESPONSE_CONFIG['feedbackTexts'];
    formattedResponseConfig = {
      wordCount: config.correct.wordCount,
      style: config.correct.style,
      description: config.correct.description
    };
  } else {
    const config = responseConfig as typeof FIELD_RESPONSE_CONFIG['title'];
    formattedResponseConfig = config;
  }

  return {
    field,
    challengeType,
    gameContext,
    existingChallenges: sortedChallenges,
    creatorInput,
    responseExpectations: formattedResponseConfig
  };
}

export function getResponseConfig(field: string, challengeType: Challenge['type']) {
  if (field === 'description' && (challengeType === 'story' || challengeType === 'travel')) {
    return FIELD_RESPONSE_CONFIG.description[challengeType];
  }
  
  if (field === 'feedbackTexts') {
    return FIELD_RESPONSE_CONFIG.feedbackTexts;
  }
  
  return FIELD_RESPONSE_CONFIG[field as keyof typeof FIELD_RESPONSE_CONFIG] ?? {
    wordCount: { min: 5, max: 15 },
    style: 'short',
    description: 'Brief text'
  };
}
