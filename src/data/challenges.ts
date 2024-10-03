import { Challenge } from '../types/challengeTypes';

interface Path {
  id: number;
  name: string;
  description: string;
  dayOnly: boolean;
  challenges: Challenge[];
}
export const paths: Path[] = [
  {
    id: 0,
    name: "Tracking Shadows in Shelby County",
    description: `Welcome to Crow Tours' first hunt: Tracking Shadows in Shelby County. As night falls, strange occurrences have been reported across this once-quiet rural community. Inexplicable sounds echo through abandoned barns, eerie figures drift between ancient trees, and an oppressive atmosphere blankets the county.
      Your mission: uncover the truth behind these supernatural disturbances. Armed with nothing but choice companions, your wits, and a cryptic guide, you'll explore forgotten corners of Shelby County, solving riddles and following clues left by those who came before. But beware—you're not alone in your search. Something watches from the shadows, its presence marked only by the rustle of crow's wings and fleeting glimpses in the moonlight.
      Can you piece together the dark history of Shelby County before dawn breaks? Or will you become another whispered legend in this haunted land? The shadows are moving. The hunt begins now.`,
    dayOnly: false,
    challenges: [
      {
        id: '0',
        type: 'travel',
        title: 'Labyrinth of Legends',
        description: `With hushed halls, I stand,
          A fortress of forgotten lore.
          My shelves, a labyrinth of legends,
          Where minds can wander and explore.
          
          Guardians of wisdom roam my aisles,
          Guiding seekers to hidden treasures.
          My tomes are lent, not given,
          Returning home after adventures.
          
          In my realm, worlds collide silently,
          Facts and fables intertwine.
          Spines aligned in perfect order,
          What am I, this haven divine?`,
        question: `Journey to the location described in this riddle.`,
        targetLocation: {
          latitude: 38.2126684,
          longitude: -85.2195733
        },
        radius: 50,
        hints: [
          "My corridors whisper of Dewey's decimals.",
          "Within my walls, you can traverse centuries without taking a step.",
          "I'm where stories slumber, waiting to be awakened by curious eyes.",
          "In my quiet domain, knowledge is freely shared but never truly leaves."
        ],
        completionFeedback: `Bravo! Your literary wit has led you to this sanctuary of stories. The next chapter of your haunted journey awaits...`,
        repeatable: false,
      },
      {

        "id": "1",
        "type": "travel",
        "title": "Whispers of a Fallen Nation",
        "description": "The spectral crows guide you through the misty graveyard, their ethereal forms weaving between weathered tombstones. They circle and descend, their otherworldly caws drawing you to a stone that time has laid low, much like the soul it commemorates.",
        "question": "Seek the fallen headstone of a woman whose name echoes that of a young nation. Her epitaph holds a clue to unlock the next mystery.",
        "targetLocation": {
          "latitude": 38.21208432122716,
          "longitude": -85.22002896736528
        },
        "radius": 15,
        "hints": [
          "She shares her name with the land of the free and the home of the brave.",
          "Though her stone has succumbed to gravity's embrace, her memory stands eternal.",
          "The earth cradles a piece of history; look for a marker that lies flat against the ground."
        ],
        "completionFeedback": "You've found the resting place of America's namesake. The crows' approval echoes through the night, but their restless spirits urge you onward. What secrets lie etched in stone?",
        "repeatable": false
      },
      {
        "id": "2",
        "type": "multipleChoice",
        "title": "A Love That Shaped a Nation",
        "description": "Standing before the fallen stone, you feel a chill wind stir the air. The crows perch silently, their obsidian eyes gleaming with otherworldly knowledge. In the fading light, you struggle to decipher the weathered epitaph.",
        "question": "Whose love did America carry to her grave? What was the first name of her devoted husband?",
        "options": ["William", "John", "George", "Thomas"],
        "correctAnswer": "John",
        "hints": [
          "His name graced the throne of England more than once.",
          "Though time has worn the stone, their love remains etched in history.",
          "The answer lies within four letters, a name as sturdy as the nation they helped build."
        ],
        "feedbackTexts": {
          "correct": "As the name 'John' passes your lips, a warm breeze caresses your face, carrying the scent of autumn leaves and distant memories. The crows take flight, their wings beating a path westward. What new mysteries await in that direction?",
          "incorrect": [
            "A mournful caw pierces the air. The crows shuffle restlessly, urging you to look closer at the stone.",
            "The wind whispers through the graveyard, carrying fragments of forgotten names. Two choices remain – which one echoes in eternity?",
            "The crows' eyes gleam with anticipation. Surely, this time, you'll uncover the truth etched in stone."
          ]
        },
        "repeatable": true
      },
      {
        "id": "3",
        "type": "travel",
        "title": "Herbal Wards",
        "description": "The crows guide you west through misty streets, their wings brushing against a fragrant breeze. As you follow, a rhyme materializes in your mind:\n\nIn Simpsonville, where stories unfold,\nStands a cottage, quaint and old.\nIts walls are white as morning frost,\nIn lavender fields, it seems lost.\nWindows wink with candlelight,\nScenting dreams throughout the night.\nA humble abode with magic inside,\nWhere herbal wonders do reside.\nThyme passes slowly 'round its door,\nSage whispers secrets from days of yore.\nBut one bloom rules this aromatic bower,\nLending its name and mystic power.\nNot grand in size, yet great in fame,\nTwo adjectives and a flower form its name.\nWhat am I, this enchanted dwelling,\nWhere purple magic is always swelling?",
        "question": "Find the location described in the riddle, where herbal magic thrives.",
        "targetLocation": {
          "latitude": 38.2216154,
          "longitude": -85.344623
        },
        "radius": 50,
        "hints": [
          "Whispers of purple dance on the breeze, guiding you to a historic abode.",
          "Seek the dwelling where tranquility blooms in neat rows.",
          "Where petals meet purpose, secrets of well-being are shared.",
          "Though night falls, the scent lingers. Return when the sun awakens the flora."
        ],
        "completionFeedback": "As you approach the charming lavender shop, waves of soothing fragrance envelop you. The crows circle overhead, their calls mingling with the gentle rustle of purple blooms. Though the shop may now sleep, you sense that its herbal treasures hold more than mere earthly power. But the crows seem restless, urging you to seek out an even older story hidden nearby...",
        "repeatable": false
      },
      {
        "id": "4",
        "type": "multipleChoice",
        "title": "Echoes of Stone and Time",
        "description": "As the lavender's scent fades, the crows lead you to a weathered sign nearby. An information plate gleams in the moonlight, hinting at the building's ancient past. The crows' caws seem to form a question about this historic neighbor of the Herbal Wards:",
        "question": "This oldest stone residence in Shelby County, once a tavern and stagecoach inn, was built in which century?",
        "options": ["17th century", "18th century", "19th century", "20th century"],
        "correctAnswer": "19th century",
        "hints": [
          "When these stones were laid, lavender was yet to bloom in these fields.",
          "The new nation was young when this inn first welcomed weary travelers.",
          "Think of a time when stagecoaches ruled the roads, long before the scent of lavender filled the air."
        ],
        "feedbackTexts": {
          "correct": "A spectral wind rustles through the inn's ancient eaves, carrying whispers of approval tinged with the faint scent of lavender. The Old Stone Inn has stood since the early 1800s, a silent witness to Shelby County's growth, from stagecoaches to aromatic herb shops. As this knowledge settles in your mind, the crows take flight, urging you to follow. What other historical secrets and botanical mysteries await your discovery?",
          "incorrect": [
            "The inn's windows seem to darken, as if disappointed. Perhaps a closer look at the information plate will reveal the truth of its long history.",
            "A ghostly sigh echoes from within the inn, carrying a hint of lavender. The stones themselves seem to urge you to reconsider your answer.",
            "The crows caw in dismay, circling between the old inn and the lavender fields. Surely, with one last careful observation, you can uncover the correct period of this historic building's birth."
          ]
        },
        "repeatable": true
      },
      {
        "id": "5",
        "type": "travel",
        "title": "The Haunted Stage",
        "description": "The crows guide you through Shelby's misty streets, their wings casting eerie shadows. As you follow, a rhyme echoes in your mind:\n\nIn Shelby's heart, a stage does stand,\nWhere tales of old enchant the land.\nBehind its doors, a story waits,\nOf royal blood and twisted fates.\nA playhouse where the past still lives,\nWhere every floorboard creaks and gives.\nSeek this place where spirits tread,\nWhere actors dare to wake the dead.\nBut as you near, tread soft and slow,\nFor in these halls, names hold power, you know.",
        "question": "Find the playhouse described in the rhyme, where theatrical ghosts await.",
        "targetLocation": {
          "latitude": 38.211494267619294,
          "longitude": -85.22017165868255
        },
        "radius": 30,
        "hints": [
          "Listen for the whispers of long-forgotten lines floating on the breeze.",
          "Where the veil between reality and fiction is thinnest, there you'll find your destination.",
          "Seek the building where masks hide more than just faces.",
          "The crows circle a structure that has seen countless stories unfold within its walls."
        ],
        "completionFeedback": "As you approach the playhouse, the air grows thick with anticipation. The crows perch silently on the roof, their eyes reflecting the weight of countless performances. You've found the stage where reality and fiction blur, but the real mystery still awaits within. What cursed tale is about to unfold on these haunted boards?",
        "repeatable": false
      },
      {
        "id": "6",
        "type": "textInput",
        "title": "Don't Speak Its Name",
        "description": "Standing before the playhouse, you feel the weight of centuries of performances pressing in around you. A poster catches your eye, but the title is obscured. As you strain to read it, a ghostly whisper fills your mind:\n\nA Scottish king, ambition's slave,\nHis lady's hands no water can lave.\nWitches three with prophecy dark,\nSet forth a path with tragedy's mark.\nBut hush! Its name must not be spoken,\nLest old theater curses be awoken.\nSuperstition holds its sway,\nO'er actors who would this role play.",
        "question": "What cursed play, by Bard's own hand, will soon upon these boards expand?",
        "correctAnswer": "Macbeth",
        "hints": [
          "The Bard's tale of a thane turned king, ambition's price paid in full.",
          "Scottish moors and moving forests set the scene for this tragedy.",
          "Actors dare not speak its name within the theater's walls.",
          "Double, double toil and trouble; fire burn and cauldron bubble."
        ],
        "feedbackTexts": {
          "correct": "As 'Macbeth' forms on your lips, a chill breeze whistles through the theater's eaves. Your crow guide ruffles its feathers, as if sensing the weight of centuries of superstition. In naming the unnamed, you've brushed against the veil between our world and that of the stage. The playhouse seems to hold its breath, waiting to see what consequences your boldness might bring.",
          "incorrect": [
            "The theater's shadows deepen, and a disembodied sigh echoes from within. Perhaps another moment's reflection will reveal the cursed play's true title.",
            "A spectral applause echoes faintly, tinged with anticipation. The correct answer awaits your next attempt, but choose wisely - the spirits grow restless.",
            "Your crow guide caws three times, like a dark omen. The air grows colder, urging you to consider carefully and try again before the final curtain falls."
          ]
        },
        "repeatable": false
      },
      {
        "id": "7",
        "type": "travel",
        "title": "Echo of a Bygone Era",
        "description": "The crows lead you through Shelby County, their wings brushing against the crisp autumn air. As you follow, a whisper of the past reaches your ears:\n\nIn the shadow of progress, it stands alone,\nA relic of an age when voices roamed.\nBefore a diner where breakfasts bloom,\nIt waits, a sentinel to conversations' tomb.\nOnce a lifeline to distant hearts,\nNow a ghost of technological arts.\nSeek this guardian of untold tales,\nWhere pocket-sized worlds now prevail.",
        "question": "Find the lone survivor of the communication revolution described in the riddle.",
        "targetLocation": {
          "latitude": 38.19053616458982,
          "longitude": -85.0911406260606
        },
        "radius": 15,
        "hints": [
          "Look for a coin-operated time capsule, once the lifeblood of long-distance dialogue.",
          "Its domain lies before a humble establishment where dawn's first light meets the aroma of home-cooked breakfasts.",
          "Seek an anachronism, a stubborn holdout against the tide of progress in our world of pocket-sized connectivity.",
          "The crows circle a structure that once connected countless lives, now standing silent amidst the bustle of modern communication."
        ],
        "completionFeedback": "As you approach the solitary payphone, a wave of nostalgia washes over you. The crows perch atop the booth, their eyes reflecting the ghostly images of countless past conversations. You've found this relic of yesteryear, but its secrets are yet to be fully unveiled. What stories might this silent sentinel hold?",
        "repeatable": false
      },
      {
        "id": "8",
        "type": "textInput",
        "title": "Whispers on the Wire",
        "description": "Standing before the payphone, you're struck by its stoic presence against the backdrop of the quaint family diner. This lone survivor of the communication revolution now stands as a silent witness to countless untold stories. Its presence here is an anachronism, a stubborn holdout against the tide of progress in our world of pocket-sized connectivity. As you study its weathered frame, you feel compelled to uncover its secrets.",
        "question": "Enter the number that defined this relic of yesteryear. (Enter only the digits, no spaces or dashes)",
        "correctAnswer": "5025551234",
        "hints": [
          "Ten digits hold the key - each one a step closer to unlocking the past.",
          "The first three numbers whisper of Kentucky's heartland.",
          "Look closely at the faded keypad, where countless fingers once dialed their connections.",
          "In the realm of phantom area codes, '502' opens the door to local legends."
        ],
        "feedbackTexts": {
          "correct": "As your fingers trace the faded numbers, a chill runs down your spine. The payphone stands silent, yet you swear you hear a faint ringing from within and the ghostly echoes of countless conversations. Your crow guide caws once, a sound of approval and urgency. What other forgotten relics might Shelby County be hiding in plain view?",
          "incorrect": [
            "The numbers swim before your eyes, rearranging themselves. Perhaps another look will reveal the truth hidden in the decaying plastic.",
            "A static crackle emanates from the payphone, as if urging you to try again. The secrets of the past are not easily surrendered.",
            "The crow caws softly, encouraging you to look closer at the weathered digits. Each number is a key to unlocking the payphone's forgotten history."
          ]
        },
        "repeatable": false
      },
      {
        id: '4',
        type: 'travel',
        title: 'The Metallic Sentinel',
        description: `By the roadside, a curious sight to see,
          A man-shaped wonder, as strange as can be.
          Not flesh and bone, but ducts and tin,
          A metallic guardian, where mysteries begin.
          Assembled from parts that cool and heat,
          This hollow figure stands complete.
          Wind whistles through its empty core,
          A roadside attraction to explore.
          Neither alive nor truly dead,
          With tubes for limbs and pipes for head.
          What tales could this silent watcher share,
          Of passing travelers and county flair?`,
        targetLocation: {
          latitude: 38.191633120656014,
          longitude: -85.10006747655054
        },
        radius: 50,
        hints: [
          "Before an aged edifice, this tube-man stands guard.",
          "At the summit of stone steps, a metallic greeter waits.",
          "By the road he waits, this man of tubes and seams.",
          "Climb to meet this ductwork sentry, where architecture meets modern art",
        ],
        completionFeedback: `As you near, the metallic figure looms larger with each stride. A crow swoops ahead, landing on the statue's outstretched arm of galvanized steel. This unconventional guardian seems to bridge past and present, its hollow body whispers secrets as the wind sings through its joints, a metallic melody that speaks of hidden histories and untold tales.?`,
        repeatable: false
      },
      {
        "id": "6a",
        "type": "travel",
        "title": "the Chainsaw Surgeon",
        "description": "The crows guide you through Shelby's historic landscape, their wings brushing against the whispers of the past. As you follow, a rhyme forms in your mind:\n\nIn Shelby's realm, where history thrives,\nA tree transformed before your eyes.\nWith roaring blade and artist's sight,\nAn eagle soars, in wood takes flight.\nStars and stripes beside it stand,\nCarved by a steady, daring hand.\nBut look below, a tale to tell,\nOf Cozine House, where memories dwell.\nSeek this sculpture, bold and free,\nWhere house and history you'll see.\nWhere chainsaw art meets hallowed ground,\nAnd nature's giant became carving's crown.",
        "question": "Find the chainsaw carving described in the rhyme, where art and history intertwine.",
        "targetLocation": {
          "latitude": 38.21222958393675,
          "longitude": -85.23119620387394
        },
        "radius": 30,
        "hints": [
          "Look for a towering wooden sentinel, where an eagle's gaze meets the stars and stripes.",
          "Seek the place where the roar of a chainsaw has given voice to Shelby's history.",
          "Near Cozine House, a transformed tree stands guard over decades of memories.",
          "The crows circle a sculpture where nature's strength has yielded to artistic vision."
        ],
        "completionFeedback": "As you approach the majestic chainsaw carving, the wooden eagle seems to come alive, its eyes reflecting centuries of Shelby County's history. The crows perch on nearby branches, their sleek forms a stark contrast to the intricate wooden sculpture. You've found this remarkable fusion of art and history, but its full story is yet to be uncovered. What secrets might be etched into its wooden grains?",
        "repeatable": false
      },
      {
        "id": "6b",
        "type": "textInput",
        "title": "The Surgeons Mark",
        "description": "Standing before the impressive chainsaw carving, you're struck by its powerful presence. The wooden eagle soars, frozen in time, with stars and stripes carved proudly beside it. Below, your eyes are drawn to an inscription that speaks of the Cozine House. As you study the intricate details, you realize that hidden within this wooden chronicle is a key to the past:\n\nNumbers etched in woody grain,\nA date when this home's life began.\nNow wood and steel in union found,\nWhere chainsaw art meets hallowed ground.\nWhat skilled hands with roaring tool,\nMade nature's giant their carving school?",
        "question": "What year is inscribed on the carving, marking the beginning of Cozine House? (Enter the full year)",
        "correctAnswer": "1916",
        "hints": [
          "The eagle watches over a date from the past century.",
          "Cozine's legacy stands tall, its birth year etched in wood.",
          "Before the Roaring Twenties, this house first saw light.",
          "Count backwards from now, more than ten decades you'll find."
        ],
        "feedbackTexts": {
          "correct": "The carved eagle seems to nod in approval as you decipher the date. Your crow guide caws softly, its voice mingling with the phantom whir of a chainsaw. This fusion of dates and artistry speaks of Shelby County's ability to honor its past while embracing creative expression. What other temporal puzzles might be waiting, hidden in plain sight across this history-rich land?",
          "incorrect": [
            "The wooden eagle's eyes seem to narrow. Perhaps another look at the carving will reveal the true date of Cozine House's birth.",
            "A breeze rustles through the sculpted flag, urging you to reexamine the inscription. The secret of Cozine House's origins remains just out of reach.",
            "Your crow guide pecks at the tree, as if pointing towards the numbers you seek. The year of Cozine House's beginning is there, waiting to be discovered in the grains of history."
          ]
        },
        "repeatable": false
      },
    ]
  }
];