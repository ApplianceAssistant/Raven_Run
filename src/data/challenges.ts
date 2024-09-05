import { Challenge } from '../types/challengeTypes';

export const challenges: Challenge[] = [
  {
    id: '0',
    type: 'travel',
    title: 'Silent Knowledge',
    description: `I'm a silent forest of knowledge,
Where whispers echo through time.
My branches hold countless stories,
Yet I never speak a rhyme.
I'm guarded by patient keepers,
Who help explorers find their way.
My treasures are freely borrowed,
But must return another day.
What am I?`,
    question: `Travel to the location described in the riddle.`,
    targetLocation: {
      latitude: 38.2123131,
      longitude: -85.2201708
    },
    radius: 1000,
    locationHints: [
      "My inhabitants are often spine-chilling.",
      "I'm a place where you can travel the world without moving your feet",
      "My visitors often judge my contents by their covers.",
      "I'm home to both fact and fiction, side by side."
    ],
    completionFeedback: `Excellent deduction! Your keen insight will be invaluable on your journey to the haunted road.`,
    repeatable: false
  },
  {
    id: '1',
    type: 'travel',
    title: 'Herbal Wards Needed',
    description: `In Simpsonville, where stories unfold,
Stands a cottage, quaint and old.
Its walls are white as morning frost,
In lavender fields, it seems lost.
Windows wink with candlelight,
Scenting dreams throughout the night.
A humble abode with magic inside,
Where herbal wonders do reside.
Thyme passes slowly 'round its door,
Sage whispers secrets from days of yore.
But one bloom rules this aromatic bower,
Lending its name and mystic power.
Not grand in size, yet great in fame,
Two adjectives and a flower form its name.
What am I, this enchanted dwelling,
Where purple magic is always swelling?`,
    question: `Travel to the location described in the riddle.`,
    targetLocation: {
      latitude: 38.2216154,
      longitude: -85.344623
    },
    radius: 1000,
    locationHints: [
      "My name suggests a modest hill, though I'm flat on the ground.",
      "Butterflies mistake me for a fragrant bloom in the town.",
      "Bees buzz around me, thinking I'm part of their lavender store.",
      "My color is reminiscent of clouds, not the flower I'm named for."
    ],
    completionFeedback: `You've proven yourself a true master of magical dwellings and herbal enigmas.`,
    repeatable: false
  },
  {
    id: '2',
    type: 'multipleChoice',
    title: 'What is the name of the haunted road?',
    description: ``,
    question: `What haunted Kentucky road shares its name with a story from the 1800's?`,
    options: [`An Occurrence at Owl Creek Bridge`, `The Monkey's Paw`, `The Legend of Sleepy Hollow`, `Mezzotint`],
    correctAnswer: 'The Legend of Sleepy Hollow',
    feedbackTexts: {
      correct: 'Correct! The Legend of Sleepy Hollow is correct!',
      incorrect: [
        'Try again!',
        'Keep trying, only two options left!',
        `Nope, surely you will get it this time!`,
      ]
    },
    repeatable: true
  },
  {
    id: '3',
    type: 'trueFalse',
    title: 'Waverly Hills Sanatorium',
    description: '',
    question: 'A Sanatorium is a facility for treating mental illness.',
    correctAnswer: false,
    feedbackTexts: {
      correct: `Correct! A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not mental illness.`,
      incorrect: [
        'A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not necessarily mental illness.',
      ]
    },
    repeatable: false
  },
  {
    id: '4',
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
  {
    id: '5',
    type: 'multipleChoice',
    title: 'How well did you pay attention?',
    description: ``,
    question: `Who did Lily call to in her last moments?`,
    options: [`God`, `Her favorite doctor`, `Her mother`, `Favorite Nurse`],
    correctAnswer: 'Favorite Nurse',
    feedbackTexts: {
      correct: 'Correct! Her favorite nurse!',
      incorrect: [
        'Try again!',
        'Keep trying, only two options left!',
        `Nope, surely you will get it this time!`,
      ]
    },
    repeatable: true
  },
  // Add more challenges here...
];