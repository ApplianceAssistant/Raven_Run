import { Challenge } from '../types/challengeTypes';

export const challenges: Challenge[] = [
  {
    id: '1',
    type: 'multipleChoice',
    title: 'Road Trip To Oblivion',
    description: `What haunted Kentucky road shares it's name with a story from the the 1800's?`,
    options: [`An Occurrence at Owl Creek Bridge`, `The Monkey's Paw`, `The Legend of Sleepy Hollow`, `Mezzotint`,],
    correctAnswer: 'Sleepy Hollow',
    feedbackTexts: {
      correct: 'As you travel down Sleepy Hollow Road make sure to keep a close eye on your rearview mirror. It is well known by Louisville residents that a phantom driver frequents this area, pursuing travelers and attempting to force them off the more than thirty-foot drop to their deaths and into eternity.',
      incorrect: [
        'Try again!',
        'keep trying, only two options left!',
        `Nope, surely you will get it this time!`,
      ]
    }
  },
  {
    id: '2',
    type: 'trueFalse',
    title: 'Waverly Hills Sanatorium',
    description: 'A Sanatorium is a facility for treating mental illness.',
    correctAnswer: 'false',
    feedbackTexts: {
      correct: `No tricking you! A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not mental illness.`,
      incorrect: [
        'A sanatorium is actually a facility for treating long-term illnesses and convalescence care, not necessarily mental illness.',
      ]
    }
  },
  {
    id: '3',
    type: 'story',
    title: 'Blood and butterflies',
    description: `In the dim hallways of Waverly Hills Sanatorium, young Lily lay in her narrow bed, her breaths coming in ragged gasps. The white walls seemed to close in around her as she battled the relentless tuberculosis ravaging her fragile body.
    Nurses moved quietly between the rows of beds, their faces etched with a mix of compassion and resignation. They had seen too many children like Lily, their lungs filling with fluid, their small frames wracked with violent coughs.
    As the sunlight faded outside, casting long shadows across the room, Lily's eyes fluttered open. Her gaze, once bright with childish wonder, now held a wisdom beyond her years. With great effort, she beckoned her favorite nurse closer.
    The nurse leaned in, her heart heavy with the knowledge of what was to come. Lily's voice, barely a whisper, carried her final words:
    "Do you see the butterflies? They're so beautiful..."
    With those words, Lily's eyes closed for the last time, her struggle finally at an end. The nurse brushed away a tear, hoping that wherever Lily had gone, it was indeed filled with beautiful butterflies, far from the pain and suffering of Waverly Hills.`,
    correctAnswer: '',
    feedbackTexts: {
      correct: 'Well done! Harper Lee wrote this classic novel.',
      incorrect: [
        `Try thinking of American authors from the 20th century.`,
        `Nope. The author's first name is Harper.`,
        `The author's last name is a first name.`,
        `The author's last name also served a confederate general.`,
      ]
    }
  }
];