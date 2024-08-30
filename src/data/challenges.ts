import { Challenge } from '../types/challengeTypes';

export const challenges: Challenge[] = [
  {
    id: '1',
    type: 'multipleChoice',
    title: 'History Question',
    description: 'Who was the first President of the United States?',
    options: ['George Washington', 'Thomas Jefferson', 'John Adams', 'Benjamin Franklin'],
    correctAnswer: 'George Washington',
    feedbackTexts: {
      correct: 'Correct! George Washington was indeed the first President.',
      incorrect: [
        'Not quite. Try again!',
        `That's not right. Here's a hint: He was a general in the Revolutionary War.`,
      ]
    }
  },
  {
    id: '2',
    type: 'latLong',
    title: 'Geography Challenge',
    description: 'What are the coordinates of the Eiffel Tower?',
    correctAnswer: [48.8584, 2.2945],
    feedbackTexts: {
      correct: `Excellent! You've pinpointed the Eiffel Tower.`,
      incorrect: [
        'Close, but not quite. Try adjusting your coordinates.',
        `That's not the right location. Remember, the Eiffel Tower is in Paris, France.`,
      ]
    }
  },
  {
    id: '3',
    type: 'text',
    title: 'Literature Question',
    description: 'Who wrote "To Kill a Mockingbird"?',
    correctAnswer: 'Harper Lee',
    feedbackTexts: {
      correct: 'Well done! Harper Lee wrote this classic novel.',
      incorrect: [
        `That's not correct. Try thinking of American authors from the 20th century.`,
        `Not quite. The author's first name is Harper.`,
      ]
    }
  }
];