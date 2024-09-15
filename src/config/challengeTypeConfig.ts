// challengeTypeConfig.ts

import { Challenge } from '../types/challengeTypes';

type FieldConfig = {
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'location';
  label: string;
};

type AllPossibleFields = {
  [K in keyof Required<Challenge>]: FieldConfig;
} & {
  options: FieldConfig;
  completionFeedback: FieldConfig;
  clues: FieldConfig;
  correctAnswer: FieldConfig;
};

type ChallengeTypeConfig = {
  [K in Challenge['type']]: Partial<AllPossibleFields>;
};

export const challengeTypeConfig: ChallengeTypeConfig = {
  story: {
    title: { required: true, type: 'text', label: 'Title' },
    description: { required: true, type: 'textarea', label: 'Story Text' },
    hints: { required: false, type: 'array', label: 'Hints' },
    repeatable: { required: false, type: 'boolean', label: 'Repeatable' },
  },
  multipleChoice: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'text', label: 'Question' },
    options: { required: true, type: 'array', label: 'Options' },
    correctAnswer: { required: true, type: 'text', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'textarea', label: 'Feedback' },
  },
  trueFalse: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'text', label: 'Question' },
    correctAnswer: { required: true, type: 'boolean', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'textarea', label: 'Feedback' },
  },
  textInput: {
    title: { required: true, type: 'text', label: 'Title' },
    question: { required: true, type: 'text', label: 'Question' },
    correctAnswer: { required: true, type: 'text', label: 'Correct Answer' },
    hints: { required: false, type: 'array', label: 'Hints' },
    feedbackTexts: { required: false, type: 'textarea', label: 'Feedback' },
  },
  travel: {
    title: { required: true, type: 'text', label: 'Title' },
    description: { required: true, type: 'textarea', label: 'Description' },
    targetLocation: { required: true, type: 'location', label: 'Target Location' },
    radius: { required: true, type: 'number', label: 'completion Radius' },
    completionFeedback: { required: true, type: 'textarea', label: 'Completion Feedback' },
    hints: { required: false, type: 'array', label: 'Hints' },
  },
  areaSearch: {
    title: { required: true, type: 'text', label: 'Title' },
    description: { required: true, type: 'textarea', label: 'Description' },
    clues: { required: true, type: 'array', label: 'Clues' },
    targetLocation: { required: true, type: 'location', label: 'Target Location' },
    radius: { required: true, type: 'number', label: 'completion Radius' },
    hints: { required: false, type: 'array', label: 'Hints' },
  },
};