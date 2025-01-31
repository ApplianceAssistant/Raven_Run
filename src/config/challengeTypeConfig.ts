// challengeTypeConfig.ts

import { Challenge } from '../types/challengeTypes';

type FieldConfig = {
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'location' | 'feedback';
  label: string;
};

type AllPossibleFields = {
  [K in keyof Required<Challenge>]: FieldConfig;
} & {
  options: FieldConfig;
  completionFeedback: FieldConfig;
  correctAnswer: FieldConfig;
  order: FieldConfig;
};

type ChallengeTypeConfig = {
  [K in Challenge['type']]: Partial<AllPossibleFields>;
};

export const challengeTypeConfig: ChallengeTypeConfig = {
  story: {
    title: { required: true, type: 'text', label: 'Title' },
    description: { required: true, type: 'textarea', label: 'Story Text' },
    repeatable: { required: false, type: 'boolean', label: 'Repeatable' },
    order: { required: true, type: 'number', label: 'Challenge Order' },
  },
  multipleChoice: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'textarea', label: 'Question' },
    options: { required: true, type: 'array', label: 'Answer Options' },
    correctAnswer: { required: true, type: 'text', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'feedback', label: 'Challenge Feedback' },
    order: { required: true, type: 'number', label: 'Challenge Order' },
  },
  trueFalse: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'textarea', label: 'Question' },
    correctAnswer: { required: true, type: 'boolean', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'feedback', label: 'Challenge Feedback' },
    order: { required: true, type: 'number', label: 'Challenge Order' },
  },
  textInput: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'textarea', label: 'Question' },
    correctAnswer: { required: true, type: 'text', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'feedback', label: 'Challenge Feedback' },
    order: { required: true, type: 'number', label: 'Challenge Order' },
  },
  travel: {
    title: { required: true, type: 'text', label: 'Title' },
    description: { required: true, type: 'textarea', label: 'Description' },
    targetLocation: { required: true, type: 'location', label: 'Target Location' },
    radius: { required: true, type: 'number', label: 'Completion Radius' },
    completionFeedback: { required: true, type: 'textarea', label: 'Completion Feedback' },
    hints: { required: false, type: 'array', label: 'Hints' },
    order: { required: true, type: 'number', label: 'Challenge Order' },
  },
};