import { Challenge } from '../types/challengeTypes';

export const challenges: Challenge[] = [
  {
    id: '0',
    type: 'travel',
    title: 'Road Trip To Oblivion',
    description: `Keep a close eye on your rearview mirror. It is well known by Louisville residents that a phantom driver frequents this area, pursuing travelers and attempting to force them off the more than thirty-foot drop to their deaths and into eternity.`,
    question: `Discover the name of the road that is said to be haunted by a phantom driver?`,
    targetLocation: {
      latitude: 38.3628781,
      longitude: -85.5354653
    },
    radius: 1000,
    locationHints: [
      "This road is located near Prospect, Kentucky.",
      "It shares its name with a famous ghost story.",
      "The road is known for its steep drops and sharp turns.",
      "The phantom driver may be in a hurry to make their tee time."
    ],
    completionFeedback: `You survived the phantom driver!`,
    repeatable: false
  },
  {
    id: '1',
    type: 'multipleChoice',
    title: 'What is the name of the haunted road?',
    description: ``,
    question: `What haunted Kentucky road shares its name with a story from the 1800's?`,
    options: [`An Occurrence at Owl Creek Bridge`, `The Monkey's Paw`, `The Legend of Sleepy Hollow`, `Mezzotint`],
    correctAnswer: 'The Legend of Sleepy Hollow',
    feedbackTexts: {
      correct: 'Your on fire! The Legend of Sleepy Hollow is the correct!',
      incorrect: [
        'Try again!',
        'Keep trying, only two options left!',
        `Nope, surely you will get it this time!`,
      ]
    },
    repeatable: true
  },
  {
    id: '2',
    type: 'trueFalse',
    title: 'Waverly Hills Sanatorium',
    description: '',
    question:'A Sanatorium is a facility for treating mental illness.',
    correctAnswer: false,
    feedbackTexts: {
      correct: `No tricking you! A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not mental illness.`,
      incorrect: [
        'A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not necessarily mental illness.',
      ]
    },
    repeatable: true
  },
  {
    id: '3',
    type: 'story',
    title: 'The Haunting of Waverly Hills',
    description: '',
    storyText: `In the dim hallways of Waverly Hills Sanatorium, young Lily lay in her narrow bed, her breaths coming in ragged gasps. The white walls seemed to close in around her as she battled the relentless tuberculosis ravaging her fragile body.
    Nurses moved quietly between the rows of beds, their faces etched with a mix of compassion and resignation. They had seen too many children like Lily, their lungs filling with fluid, their small frames wracked with violent coughs.
    As the sunlight faded outside, casting long shadows across the room, Lily's eyes fluttered open. Her gaze, once bright with childish wonder, now held a wisdom beyond her years. With great effort, she beckoned her favorite nurse closer.
    The nurse leaned in, her heart heavy with the knowledge of what was to come. Lily's voice, barely a whisper, carried her final words:
    "Do you see the butterflies? They're so beautiful..."
    With those words, Lily's eyes closed for the last time, her struggle finally at an end. The nurse brushed away a tear, hoping that wherever Lily had gone, it was indeed filled with beautiful butterflies, far from the pain and suffering of Waverly Hills.`,
    repeatable: false
  },
  // Add more challenges here...
];