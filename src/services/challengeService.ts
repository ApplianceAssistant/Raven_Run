const challenges = [
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
    // ... more challenges
  ];
  
  export function getChallenges() {
    return challenges;
  }
  
  export function checkAnswer(challenge, answer) {
    if (Array.isArray(challenge.correctAnswer) && Array.isArray(answer)) {
      // For lat/long answers, check if within 0.01 degrees
      return Math.abs(challenge.correctAnswer[0] - answer[0]) < 0.01 &&
             Math.abs(challenge.correctAnswer[1] - answer[1]) < 0.01;
    }
    return challenge.correctAnswer === answer;
  }
  
  export function getRandomIncorrectFeedback(challenge) {
    const incorrectFeedbacks = challenge.feedbackTexts.incorrect;
    return incorrectFeedbacks[Math.floor(Math.random() * incorrectFeedbacks.length)];
  }