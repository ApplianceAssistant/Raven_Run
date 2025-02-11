const audioFiles = {
    wrong: ['/audio/wrong_crow_short.mp3', '/audio/wrong_crow_short.ogg'],
    correct: ['/audio/correct_crow_short.mp3', '/audio/correct_crow_short.ogg'],
    locationReached: ['/audio/location_reached_crow.mp3', '/audio/location_reached_crow.ogg'],
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const loadAudioBuffer = async (url) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
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
                console.error(`Error loading audio ${type}:`, e);
                console.error(`Audio error code: ${audio.error ? audio.error.code : 'N/A'}`);
                console.error(`Audio error message: ${audio.error ? audio.error.message : 'N/A'}`);
                reject(e);
            }
        };

        audio.load();
    });
};

export const playAudio = async (type) => {
    
    if (!audioFiles[type]) {
      console.error(`Audio type "${type}" not found`);
      return;
    }
  
    try {
      const audioBuffer = await loadAudioBuffer(audioFiles[type][0]);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
    } catch (error) {
      console.error(`Error in playAudio function (${type}):`, error);
    }
  };

// Preload audio files
Object.keys(audioFiles).forEach(type => loadAudio(type).catch(error => console.error(`Failed to preload ${type}:`, error)));