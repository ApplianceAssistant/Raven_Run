import { challenges } from '../data/challenges.ts';
  
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