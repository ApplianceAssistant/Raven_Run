const fs = require('fs');
const path = require('path');

// Read the challenges.ts file
const challengesPath = path.join(__dirname, '../../src/data/challenges.ts');
const content = fs.readFileSync(challengesPath, 'utf8');

// Extract the games array
const gamesMatch = content.match(/export const games: Game\[\] = (\[[\s\S]*?\]);/);
if (gamesMatch) {
    const gamesData = gamesMatch[1];
    
    // Create a function that will evaluate the games array
    const evalStr = `
        const games = ${gamesData};
        JSON.stringify(games);
    `;
    
    // Evaluate the string and get JSON
    const jsonStr = eval(evalStr);
    
    // Write the JSON to a file
    fs.writeFileSync(path.join(__dirname, 'games.json'), jsonStr);
} else {
    console.error('Failed to extract games data from challenges.ts');
}
