// src/utils/audioFeedback.js

const audioFiles = {
    wrong: ['/audio/wrong_crow_short.mp3', '/audio/wrong_crow_short.ogg', '/audio/wrong_crow_short.au'],
    correct: ['/audio/correct_crow_short.mp3', '/audio/correct_crow_short.ogg', '/audio/correct_crow_short.au'],
    locationReached: ['/audio/location_reached_crow.mp3', '/audio/location_reached_crow.ogg', '/audio/location_reached_crow.au'],
  };
  
  const createAudio = (sources) => {
    const audio = new Audio();
    sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source;
      sourceElement.type = `audio/${source.split('.').pop()}`;
      audio.appendChild(sourceElement);
    });
    return audio;
  };
  
  const audioInstances = Object.fromEntries(
    Object.entries(audioFiles).map(([key, sources]) => [key, createAudio(sources)])
  );
  
  export const playAudio = (type) => {
    if (audioInstances[type]) {
      audioInstances[type].play().catch(error => {
        console.warn(`Error playing audio (${type}):`, error);
        // Optionally, you could try to reload the audio here
        // audioInstances[type].load();
      });
    } else {
      console.warn(`Audio type "${type}" not found`);
    }
  };
  
  // Preload audio files
  Object.values(audioInstances).forEach(audio => audio.load());