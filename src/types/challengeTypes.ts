export interface Challenge {
    id: string;
    type: 'multipleChoice' | 'latLong' | 'text';
    title: string;
    description: string;
    options?: string[];
    correctAnswer?: string | number[];
    feedbackTexts: {
      correct: string;
      incorrect: string[];
    };
  }
  
  export type ChallengeType = 'multipleChoice' | 'latLong' | 'text';
  
  export interface FeedbackTexts {
    correct: string;
    incorrect: string[];
  }