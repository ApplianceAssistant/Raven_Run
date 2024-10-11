const audioFiles = {
    wrong: ['/audio/wrong_crow_short.mp3', '/audio/wrong_crow_short.ogg', '/audio/wrong_crow_short.au'],
    correct: ['/audio/correct_crow_short.mp3', '/audio/correct_crow_short.ogg', '/audio/correct_crow_short.au'],
    locationReached: ['/audio/location_reached_crow.mp3', '/audio/location_reached_crow.ogg', '/audio/location_reached_crow.au'],
  };
  
  const audioInstances = {};
  
  const loadAudio = (type) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      let loaded = false;
  
      audioFiles[type].forEach(file => {
        const source = document.createElement('source');
        source.src = file;
        source.type = `audio/${file.split('.').pop()}`;
        audio.appendChild(source);
      });
  
      audio.oncanplaythrough = () => {
        if (!loaded) {
          loaded = true;
          resolve(audio);
        }
      };
  
      audio.onerror = (e) => {
        if (!loaded) {
          console.warn(`Error loading audio ${type}:`, e);
          reject(e);
        }
      };
  
      audio.load();
    });
  };
  
  export const playAudio = async (type) => {
    console.warn(`Attempting to play audio: ${type}`);
    
    if (!audioFiles[type]) {
      console.warn(`Audio type "${type}" not found`);
      return;
    }
  
    try {
      if (!audioInstances[type]) {
        console.warn(`Loading audio: ${type}`);
        audioInstances[type] = await loadAudio(type);
      }
  
      const audio = audioInstances[type];
      
      // Reset the audio to the beginning
      audio.currentTime = 0;
      
      console.warn(`Playing audio: ${type}`);
      await audio.play();
      
      console.warn(`Audio played successfully: ${type}`);
    } catch (error) {
      console.error(`Error playing audio (${type}):`, error);
    }
  };
  
  // Preload audio files
  Object.keys(audioFiles).forEach(type => loadAudio(type).catch(error => console.warn(`Failed to preload ${type}:`, error)));