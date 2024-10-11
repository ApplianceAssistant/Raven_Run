import React from 'react';
import { playAudio } from '../utils/audioFeedback';

function AudioTest() {
  const testAudio = (type) => {
    playAudio(type).catch(error => console.error(`Error playing ${type} audio:`, error));
  };

  return (
    <div>
      <h2>Audio Test Component</h2>
      <button onClick={() => testAudio('wrong')}>Play Wrong Sound</button>
      <button onClick={() => testAudio('correct')}>Play Correct Sound</button>
      <button onClick={() => testAudio('locationReached')}>Play Location Reached Sound</button>
      
      <h3>Direct HTML5 Audio Test</h3>
         <audio controls src="/audio/wrong_crow_short.mp3">
           Your browser does not support the audio element.
         </audio>
    </div>
  );
}

export default AudioTest;