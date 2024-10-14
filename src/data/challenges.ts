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
        title: 'Labyrinth of Knowledge',
        description: `With hushed halls, I stand,\n
          A fortress of forgotten lore.\n
          My shelves, a labyrinth of knowledge,\n
          Where minds can wander and explore.\n
          
          Guardians of wisdom roam my aisles,\n
          Guiding seekers to hidden treasures.\n
          My tomes are lent, not given,\n
          Returning home after adventures.\n
          
          In my realm, worlds collide silently,\n
          Facts and fables intertwine.\n
          Spines aligned in perfect order,\n
          What am I, this haven divine?`,
        question: `Journey to the location described in this riddle.`,
        targetLocation: {
          latitude: 38.212354,
          longitude:-85.219853
        },
        radius: 15,
        hints: [
          "My corridors whisper of Dewey's decimals.",
          "Within my walls, you can traverse centuries without taking a step.",
          "I'm where stories slumber, waiting to be awakened by curious eyes.",
          "In my quiet domain, knowledge is freely shared but never truly leaves."
        ],
        completionFeedback: `Bravo! Your literary wit has led you to this sanctuary of stories. The next chapter of your haunted journey awaits...`,
        repeatable: true,
      },
      {
        id: '1',
        type: "travel",
        title: "Whispers of the Fallen",
        description: "The spectral crows guide you through the misty graveyard, their ethereal forms weaving between weathered tombstones. They circle and descend, their otherworldly caws drawing you to a stone that time has laid low, much like the soul it commemorates.",
        question: "Seek the fallen headstone of a woman whose name echoes that of a young nation. Her epitaph holds a clue to unlock the next mystery.",
        targetLocation: {
          latitude: 38.212159,
          longitude: -85.220157
        },
        radius: 15,
        hints: [
          "She shares her name with the land of the free and the home of the brave.",
          "Though her stone has succumbed to gravity's embrace, her memory stands eternal.",
          "The earth cradles a piece of history; look for a marker that lies flat against the ground."
        ],
        completionFeedback: "You've found the resting place of America's namesake. The crows' approval echoes through the night, but their restless spirits urge you onward. What secrets lie etched in stone?",
        repeatable: true
      },
      {
        id: "2",
        type: "multipleChoice",
        title: "A Love That Shaped a Nation",
        description: "Standing before the fallen stone, a chill wind stirs the air. The crows perch silently, their obsidian eyes gleaming with otherworldly knowledge. In the fading light, you struggle to decipher the weathered epitaph.",
        question: "Whose love did America carry to her grave? What was the first name of her devoted husband?",
        options: ["William", "John", "George", "Thomas"],
        correctAnswer: "John",
        hints: [
          "His name graced the throne of England more than once.",
          "Though time has worn the stone, their love remains etched in history.",
          "The answer lies within four letters, a name as sturdy as the nation they helped build."
        ],
        feedbackTexts: {
          correct: "As the name 'John' passes your lips, a warm breeze caresses your face, carrying the scent of autumn leaves and distant memories. The crows take flight, their wings beating a path westward. What new mysteries await in that direction?",
          incorrect: [
            "A mournful caw pierces the air. The crows shuffle restlessly, urging you to look closer at the stone.",
            "The wind whispers through the graveyard, carrying fragments of forgotten names. Two choices remain – which one echoes in eternity?",
            "The crows' eyes gleam with anticipation. Surely, this time, you'll uncover the truth etched in stone."
          ]
        },
        repeatable: true
      },
      {
        id: "3",
        type: "travel",
        title: "Herbal Wards",
        description: `The crows guide you west through misty streets, their wings brushing against a fragrant breeze. As you follow, a rhyme materializes in your mind:
        \n
        In Simpsonville, where stories unfold,\n
        Stands a cottage, quaint and old.\n
        Its walls are white as morning frost,\n
        In lavender fields, it seems lost.\n
        Windows wink with candlelight,\n
        Scenting dreams throughout the night.\n
        A humble abode with magic inside,\n
        Where herbal wonders do reside.\n
        Thyme passes slowly 'round its door,\n
        Sage whispers secrets from days of yore.\n
        But one bloom rules this aromatic bower,\n
        Lending its name and mystic power.\n
        Not grand in size, yet great in fame,\n
        Two adjectives and a flower form its name.\n
        What am I, this enchanted dwelling,\n
        Where purple magic is always swelling?`,
        question: "Find the location described in the riddle, where herbal magic thrives.",
        targetLocation: {
          latitude: 38.222147,
          longitude: -85.347739
        },
        radius: 15,
        hints: [
          "Whispers of purple dance on the breeze, guiding you to a historic abode.",
          "Seek the dwelling where tranquility blooms in neat rows.",
          "Where petals meet purpose, secrets of well-being are shared.",
          "Though night falls, the scent lingers. Return when the sun awakens the flora."
        ],
        completionFeedback: "As you approach the charming lavender shop, waves of soothing fragrance envelop you. The crows circle overhead, their calls mingling with the gentle rustle of purple blooms. Though the shop may now sleep, you sense that its herbal treasures hold more than mere earthly power. The crows seem restless, urging you to seek out an even older story hidden nearby...",
        repeatable: true
      },
      {
        id: "4",
        type: "multipleChoice",
        title: "Echoes of Stone and Time",
        description: `As the lavender's scent fades, the crows lead you to a weathered sign nearby.\n
        An information plate gleams in the moonlight, hinting at the building's ancient past.\n
        The crows' caws seem to form a question about this historic neighbor of the Herbal Wards:`,
        question: "This oldest stone residence in Shelby County, once a tavern and stagecoach inn, was built in which century?",
        options: ["17th century", "18th century", "19th century", "20th century"],
        correctAnswer: "19th century",
        hints: [
          "When these stones were laid, lavender was yet to bloom in these fields.",
          "The new nation was young when this inn first welcomed weary travelers.",
          "Think of a time when stagecoaches ruled the roads, long before the scent of lavender filled the air."
        ],
        feedbackTexts: {
          correct: "A spectral wind rustles through the inn's ancient eaves, carrying whispers of approval tinged with the faint scent of lavender. The Old Stone Inn has stood since the early 1800s, a silent witness to Shelby County's growth, from stagecoaches to aromatic herb shops. As this knowledge settles in your mind, the crows take flight, urging you to follow. What other historical secrets and botanical mysteries await your discovery?",
          incorrect: [
            "The inn's windows seem to darken, as if disappointed. Perhaps a closer look at the information plate will reveal the truth of its long history.",
            "A ghostly sigh echoes from within the inn, carrying a hint of lavender. The stones themselves seem to urge you to reconsider your answer.",
            "The crows caw in dismay, circling between the old inn and the lavender fields. Surely, with one last careful observation, you can uncover the correct period of this historic building's birth."
          ]
        },
        repeatable: true
      },
      {
        id: '5',
        type: 'travel',
        title: "Sentinel of the Skies",
        description: `The crows lead you through the misty dawn, their wings brushing against the first light of day. As you follow, a new verse forms in your mind:\n
      
          Rising from the earth, a titan stands,\n
          A pallid globe atop its circular bands.\n
          Neither tree nor building, yet reaching high,\n
          A silent guardian 'twixt ground and sky.\n
      
          Within its core, life's essence flows,\n
          A secret spring that ebbs and grows.\n
          Fenced and guarded, its base secured,\n
          What cosmic truths might it have procured?\n
      
          Seek this colossus, pale and round,\n
          Where liquid whispers make no sound.\n
          What tales could this sentient sphere impart,\n
          Of Shelby's thirst and hydrous art?`,
        question: "Find the towering structure described in the verse, where Shelby's lifeblood is stored high above the ground.",
        targetLocation: {
          latitude: 38.2208191,
          longitude: -85.3578345
        },
        radius: 20,
        hints: [
          "Look for a structure that seems to touch the clouds, its round top visible for miles.",
          "Seek a pale giant that holds Shelby's most precious resource.",
          "Find the place where gravity and engineering dance, keeping a town's thirst at bay.",
          "The crows circle a cylindrical tower crowned with a sphere, its purpose both mundane and mysterious."
        ],
        completionFeedback: `As you approach the massive water tower, its looming presence fills you with a sense of awe. The crows alight on the surrounding fence, their eyes gleaming with an otherworldly knowledge. This silent sentinel, holding the very essence of life within its metal shell, seems to pulse with an energy that goes beyond its practical purpose. What secrets might this towering guardian of Shelby's water supply be privy to, watching over the county day and night?`,
        repeatable: true
      },
      {
        id: '6',
        type: 'textInput',
        title: "The Road to Liquid Heights",
        description: `Standing before the towering water reservoir, you're struck by its imposing presence against the Simpsonville sky. The crows circle overhead, their caws seeming to form words on the wind:\n
      
          Beneath the titan's watchful gaze,\n
          A path winds through the morning haze.\n
          Its name speaks of vistas wide and fair,\n
          And digits that the postman bears.\n
      
          This road that leads to watery heights,\n
          Holds secrets of Shelbyville's sights.\n
          What moniker graces this asphalt trail,\n
          Where the water guardian stands tall and pale?`,
        question: "What is the name of the road where this colossal water tower stands?",
        correctAnswer: "Fairview",
        hints: [
          "The road's name suggests a pleasant view.",
          "Look for a street sign.",
          "The name consists of one word.",
          "This offers a 'fair view' of the surrounding area."
        ],
        feedbackTexts: {
          correct: "As you speak the road's name, 'Fairview', a soft hum emanates from the water tower. The crows nod in approval, their eyes gleaming with otherworldly knowledge. This road, leading to Shelby's liquid lifeline, seems to pulse with hidden significance. What other secrets might be hidden in the everyday details of the landscape?",
          incorrect: [
            "The water tower seems to loom larger, as if urging you to look closer at your surroundings.",
            "A crow swoops down, circling the base of the tower. Perhaps another glance at a nearby street sign will reveal the answer.",
            "The wind whispers through the tower's structure, carrying fragments of street names. The correct answer is within reach, waiting to be pieced together."
          ]
        },
        repeatable: true
      },
      {
        id: "7",
        type: "travel",
        title: "The Haunted Stage",
        description: `The crows guide you through Shelby's misty streets, their wings casting eerie shadows. As you follow, a new rhyme pervades your thoughts:\n
        In Shelbyville's heart, a stage does stand,\n
        Where tales of old enchant the land.\n
        Behind its doors, a story waits,\n
        Of royal blood and twisted fates.\n
        A playhouse where the past still lives,\n
        Where every floorboard creaks and gives.\n
        Seek this place where spirits tread,\n
        Where actors dare to wake the dead.\n
        But as you near, tread soft and slow,\n
        For in these halls, names hold power, you know.`,
        question: "Find the stage described in the rhyme, where theatrical ghosts await.",
        targetLocation: {
          latitude: 38.2114204,
          longitude: -85.2204024
        },
        radius: 15,
        hints: [
          "Listen for the whispers of long-forgotten lines floating on the breeze.",
          "Where the veil between reality and fiction is thinnest, there you'll find your destination.",
          "Seek the building where masks hide more than just faces.",
          "The crows circle a structure that has seen countless stories unfold within its walls."
        ],
        completionFeedback: "As you approach the playhouse, the air grows thick with anticipation. The crows perch silently on the roof, their eyes reflecting the weight of countless performances. You've found the stage where reality and fiction blur, but the real mystery still awaits within. What cursed tale is about to unfold on these haunted boards?",
        repeatable: true
      },
      {
        id: "8",
        type: "textInput",
        title: "Don't Speak Its Name",
        description: `Standing before the playhouse, you feel the weight of centuries of performances pressing in around you. A poster catches your eye, but the title is obscured. As you strain to read it, a ghostly whisper fills your mind:\n
        A Scottish king, ambition's slave,\n
        His lady's hands no water can lave.\n
        Witches three with prophecy dark,\n
        Set forth a path with tragedy's mark.\n
        But hush! Its name must not be spoken,\n
        Lest old theater curses be awoken.\n
        Superstition holds its sway,\n
        O'er actors who would this role play.`,
        question: "What cursed play, by Bard's own hand, will soon upon these boards expand?",
        correctAnswer: "Macbeth",
        hints: [
          "The Bard's tale of a thane turned king, ambition's price paid in full.",
          "Scottish moors and moving forests set the scene for this tragedy.",
          "Actors dare not speak its name within the theater's walls.",
          "Double, double toil and trouble; fire burn and cauldron bubble."
        ],
        feedbackTexts: {
          correct: "As 'Macbeth' forms on your lips, a chill breeze whistles through the theater's eaves. Your crow guide ruffles its feathers, as if sensing the weight of centuries of superstition. In naming the unnamed, you've brushed against the veil between our world and that of the stage. The playhouse seems to hold its breath, waiting to see what consequences your boldness might bring.",
          incorrect: [
            "The theater's shadows deepen, and a disembodied sigh echoes from within. Perhaps another moment's reflection will reveal the cursed play's true title.",
            "A spectral applause echoes faintly, tinged with anticipation. The correct answer awaits your next attempt, but choose wisely - the spirits grow restless.",
            "Your crow guide caws three times, like a dark omen. The air grows colder, urging you to consider carefully and try again before the final curtain falls."
          ]
        },
        repeatable: true
      },
      {
        id: "9",
        type: "travel",
        title: "Echo of a Bygone Era",
        description: `The crows lead you through Shelby County, their wings brushing against the crisp autumn air. As you follow, a whisper of the past reaches your ears:\n
          In the shadow of progress, it stands alone,\n
          Where coin clicks still spark connection's tone.\n
          Before a diner where breakfasts bloom,\n
          It waits, a beacon midst digital gloom.\n
          Once the sole lifeline, with operators' aid,\n
          Now rare, but its dial tone hasn't strayed.\n
          Seek this guardian of tales untold,\n
          A working relic from the days of old.`,
        question: "Find the lone survivor of the communication revolution described in the riddle.",
        targetLocation: {
          latitude: 38.190568,
          longitude: -85.091241
        },
        radius: 15,
        hints: [
          "Look for a coin-operated time capsule, once the lifeblood of long-distance dialogue.",
          "Its domain lies before a humble establishment where dawn's first light meets the aroma of delicious home-cooked breakfasts.",
          "Seek an anachronism, a stubborn holdout against the tide of progress in our world of pocket-sized connectivity.",
          "The crows circle a structure that once connected countless lives, now standing silent amidst the bustle of modern communication."
        ],
        completionFeedback: "As you approach the solitary payphone, a wave of nostalgia washes over you. The crows perch atop the booth, their eyes reflecting the ghostly images of countless past conversations. You've found this relic of yesteryear, but its secrets are yet to be fully unveiled. What stories might this silent sentinel hold?",
        repeatable: true
      },
      {
        id: "10",
        type: "travel",
        title: "The Chainsaw Surgeon",
        description: `The crows guide you through Shelby's historic landscape, their wings brushing against the whispers of the past. A rhyme forms in your mind:\n
        In Shelby's realm, where history thrives,\n
        A tree transformed before your eyes.\n
        With roaring blade and artist's sight,\n
        An eagle soars, in wood takes flight.\n
        Stars and stripes beside it stand,\n
        Carved by a steady, daring hand.\n
        But look below, a tale to tell,\n
        Of Cozine House, where memories dwell.\n
        Seek this sculpture, bold and free,\n
        Where house and history you'll see.\n
        Where chainsaw art meets hallowed ground,\n
        And nature's giant became carving's crown.`,
        question: `Find the chainsaw carving described in the rhyme, where art and history intertwine.`,
        targetLocation: {
          latitude: 38.212333,
          longitude: -85.231086
        },
        radius: 20,
        hints: [
          "Look for a towering wooden sentinel, where an eagle's gaze meets the stars and stripes.",
          "Seek the place where the roar of a chainsaw has given voice to Shelby's history.",
          "Near Cozine House, a transformed tree stands guard over decades of memories.",
          "The crows circle a sculpture where nature's strength has yielded to artistic vision."
        ],
        completionFeedback: "As you approach the majestic chainsaw carving, the wooden eagle seems to come alive, its eyes reflecting centuries of Shelby County's history. The crows perch on nearby branches, their sleek forms a stark contrast to the intricate wooden sculpture. You've found this remarkable fusion of art and history, but its full story is yet to be uncovered. What secrets might be etched into its wooden grains?",
        repeatable: true
      },
      {
        id: "11",
        type: "textInput",
        title: "The Surgeon's Mark",
        description: `Standing before the impressive chainsaw carving, you're struck by its powerful presence.\n
        The wooden eagle soars, frozen in flight, with stars and stripes carved proudly beside it.\n
        Below, your eyes are drawn to an inscription that speaks of the Cozine House.\n
        As you study the intricate details, you realize that hidden within this wooden chronicle is a key to the past:\n
        Numbers etched in woody grain,\n
        A date when this home's life began.\n
        Now wood and steel in union found,\n
        Where chainsaw art meets hallowed ground.\n
        What skilled hands with roaring tool,\n
        Made nature's giant their carving school?`,
        question: "What year is inscribed on the carving, marking the beginning of Cozine House? (Enter the full year)",
        correctAnswer: "1916",
        hints: [
          "The eagle watches over a date from the past century.",
          "Cozine's legacy stands tall, its birth year etched in wood.",
          "Before the Roaring Twenties, this house first saw light.",
          "Count backwards from now, more than ten decades you'll find."
        ],
        feedbackTexts: {
          correct: "The carved eagle seems to nod in approval as you decipher the date. Your crow guide caws softly, its voice mingling with the phantom whir of a chainsaw. This fusion of dates and artistry speaks of Shelby County's ability to honor its past while embracing creative expression. What other temporal puzzles might be waiting, hidden in plain sight across this history-rich land?",
          incorrect: [
            "The wooden eagle's eyes seem to narrow. Perhaps another look at the carving will reveal the true date of Cozine House's birth.",
            "A breeze rustles through the sculpted flag, urging you to reexamine the inscription. The secret of Cozine House's origins remains just out of reach.",
            "Your crow guide pecks at the tree, as if pointing towards the numbers you seek. The year of Cozine House's beginning is there, waiting to be discovered in the grains of history."
          ]
        },
        repeatable: true
      },
      {
        id: "12",
        type: "travel",
        title: "Guardian of Grain",
        description: `The murder of crows guides you through Shelbyville's streets, their dark forms stark against the moonlit sky. As you follow, an enigmatic verse forms in your mind:\n

          Where farmland meets artistic flair,\n
          A steed of voids stands proud and rare.\n
          Before stone sentinels, cylindrical and tall,\n
          This airy guardian watches over all.\n

          Not flesh, nor solid form complete,\n
          But outlined essence, a sculptural feat.\n
          Where travelers pause and stories unfold,\n
          This phantom horse breaks the mold.\n

          Seek the place where welcome abounds,\n
          Where negative space with steel surrounds.\n
          A paradox of absence and form,`,
        question: "Locate the enigmatic sculpture described in the verse, where modern art meets rural heritage.",
        targetLocation: {
          latitude: 38.213484,
          longitude: -85.218341
        },
        radius: 15,
        hints: [
          "Look for a horse-shaped void where conferences convene and travelers find guidance.",
          "Three cylindrical titans of agriculture stand behind this artistic anomaly.",
          "On Seventh Street, a skeletal steed keeps silent vigil.",
          "The crows circle a structure where empty spaces outline Shelbyville's evolving identity."
        ],
        completionFeedback: `As you approach, the moonlight filters through the sculpture's open framework, casting intricate shadows on the ground. The ethereal steed stands proudly before the looming silos, a striking juxtaposition of Shelbyville's agricultural past and artistic present. Your corvid guides alight upon the nearby welcome center, their eyes gleaming with anticipation. What secrets might this modern sentinel, formed as much by absence as presence, be guarding?`,
        repeatable: true
      },
      {
        id: "13",
        type: "multipleChoice",
        title: "Voids of Vision",
        description: `Standing before the ethereal equine sculpture, you're struck by its surreal presence against the backdrop of the imposing silos. The open framework of steel outlines a horse's form, allowing glimpses of the sky and silos through its body. As you move around it, the interplay of solid and void creates an ever-changing silhouette. Your crow companions hop closer, peering curiously through the sculpture's empty spaces.\n
          As you study this artistic marvel, you ponder its significance:\n
      
          In void and stone, a tale is spun,\n
          Of Shelbyville, two eras as one.\n
          A steed of air, no stable required,\n
          Guarding stories, old and newly inspired.\n
      
          But why a horse of empty space,\n
          Before these towers from a bygone place?\n
          What truth does this union impart,\n
          Of Shelbyville's transforming heart?`,
        question: "What does the juxtaposition of the modern, airy horse sculpture and the traditional grain silos likely symbolize for Shelbyville?",
        options: [
          "The replacement of agriculture with technology",
          "The conflict between rural and urban values",
          "The balance of preserving heritage while embracing progress",
          "The decline of equestrian culture in favor of industry"
        ],
        correctAnswer: "The balance of preserving heritage while embracing progress",
        hints: [
          "Consider how the open design of the sculpture contrasts with the solid silos, yet both coexist.",
          "Reflect on how Shelbyville might honor its substantial past while creating space for new ideas.",
          "Think about what the welcome center's location suggests about the town's priorities.",
          "Ponder how the sculpture's blend of presence and absence might represent Shelbyville's journey."
        ],
        feedbackTexts: {
          correct: "As you voice this insight, a breeze whistles through the steel horse's framework, creating a soft, approving whistle. Your understanding of Shelbyville's delicate balance between honoring its agricultural roots and fostering artistic growth resonates through the sculpture's open spaces. The crows caw softly, as if affirming your grasp of this town's evolving identity. What other harmonies of past and present might you uncover as you continue your nocturnal exploration?",
          incorrect: [
            "The steel horse's outline seems to waver in the moonlight. Perhaps there's a more nuanced interpretation to be found in this artistic choice.",
            "A cool breeze whispers through the sculpture's empty spaces, carrying the faint scent of harvested grain. The answer may lie in finding harmony rather than conflict.",
            "The crows rustle their feathers, urging you to look beyond what's there and what's not. How might this art piece speak to Shelbyville's journey through time?"
          ]
        },
        repeatable: true
      },
      {
        id: '14',
        type: 'travel',
        title: "Fortress of Forgotten Freedom",
        description: `As night deepens, your crow guides lead you through Shelbyville's shadowy streets. Their urgency grows as you approach your next destination. A haunting verse forms in your mind:\n
          Three stories tall, a citadel stands,\n
          Built from stone by long-gone hands.\n
          Once it held those who strayed,\n
          Now empty cells where shadows played.\n
          Windows sealed with mortar's might,\n
          Bars entombed from human sight.\n
          On corners perched, green-capped towers rise,\n
          Silent sentinels 'neath starlit skies.\n
          Tan hewn blocks tell tales untold,\n
          Of justice served in days of old.\n
          What spirits linger, what secrets keep,\n
          In this fortress where freedom once did weep?`,
        question: "Locate the imposing structure described in the verse, where past transgressions echo in stone walls.",
        targetLocation: {
          latitude: 38.2116650,
          longitude: -85.2159704
        },
        radius: 20,
        hints: [
          "Seek a building that stands as a testament to past justice, its windows now blind to the outside world.",
          "Look for corner towers crowned with green copper caps, guarding secrets of yesteryear.",
          "Find the place where tan stone blocks rise three stories high, holding untold stories within.",
          "The crows circle a structure once filled with the clanging of iron bars, now silent but for the whispers of history."
        ],
        completionFeedback: `As you approach the towering old jail, its imposing presence seems to push against the very air around it. The crows alight on the green-capped towers, their eyes reflecting the weight of countless untold stories. This fortress of forgotten freedom stands as a silent witness to Shelbyville's past, its sealed windows and bricked-up bars hinting at the lives once contained within. What whispers of history might still echo through these weathered stone walls?\nThe crows' caws seem to carry a warning: some secrets are best left undisturbed. Yet, as a seeker of Shelby's hidden truths, you feel compelled to uncover what lies beneath the surface of this formidable structure. What will your next move be in unraveling the mysteries of this stone sentinel?`,
        repeatable: true
      },
      {
        id: '15',
        type: 'multipleChoice',
        title: "Portals to the Past",
        description: `Standing before the imposing old jail, your gaze is drawn to its weathered façade. The crows perch on the green-capped towers, their eyes glinting with spectral knowledge. As you study the building's face on Washington Street, a whispered verse reaches your ears:\n
          Stone sentinels stand in solemn row,\n
          Where freedom's light once used to glow.\n
          Most sealed tight by time's decree,\n
          But some still peer out, defiant and free.\n
          Count the eyes that still can see,\n
          On Washington Street, how many be?\n
          These unsealed portals to yesterday,\n
          What tales of old might they convey?`,
        question: "How many windows remain unsealed on the Washington Street side of the old jail?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2",
        hints: [
          "Look closely at the façade facing Washington Street.",
          "Most windows have been sealed, but a few remain open to the world.",
          "The number is less than you might expect for such a large building.",
          "Think of a pair, a duo, a couple."
        ],
        feedbackTexts: {
          correct: `As you whisper 'two', a chill breeze whistles through the unsealed windows, carrying echoes of long-forgotten voices. The crows nod in approval, their eyes gleaming with otherworldly knowledge. These twin portals to the past seem to hold countless untold stories. What secrets might they have witnessed over the years, and what truths do they still guard?\n
          Your keen observation skills have unveiled another layer of Shelbyville's hidden history. But remember, in this journey through shadow and time, every revelation often leads to deeper mysteries.`,
          incorrect: [
            "The stone walls seem to shift slightly, as if urging you to look again. Perhaps another careful count of the unsealed windows will reveal the truth.",
            "A crow caws softly, drawing your attention back to the Washington Street façade. The answer is there, waiting to be discovered in the play of light and shadow.",
            "The wind whispers through the building, carrying fragments of counting rhymes. Take a deep breath and try again - the correct number of unsealed windows is within your grasp."
          ]
        },
        repeatable: true
      },
      {
        id: '16',
        type: 'travel',
        title: "Brew of Creativity",
        description: `As dawn breaks over Shelbyville, your crow guides lead you towards a hub of local culture and warmth. The aroma of freshly roasted coffee beans wafts through the air, carrying with it whispers of art and community. A rhythmic verse forms in your mind:\n
          Where streets of six and main collide,\n
          A haven of warmth and art resides.\n
          Beans roast and grind with careful grace,\n
          While books and paintings find their place.\n
          Outside, cobblestones whisper tales,\n
          Of gatherings beneath triangle veils.\n
          Hues of shade dance overhead,\n
          While melodies of life are spread.\n
          Seek this nexus of brew and song,\n
          Where Shelby's heart beats loud and strong.\n
          What secrets might these coffee grounds impart,\n
          Of a town where culture and community are art?`,
        question: "Find the vibrant locale described in the verse, where coffee, culture, and community converge.",
        targetLocation: {
          latitude: 38.2111379,
          longitude: -85.2172542
        },
        radius: 20,
        hints: [
          "Look for a place where the scent of freshly roasted coffee mingles with the sound of turning pages.",
          "Seek a gathering spot near an intersection that shares its name with the establishment.",
          "Find where cobblestone paths lead to a canopy of colorful triangles, often alive with music.",
          "The crows circle a building where local flavors and local talent brew together in perfect harmony."
        ],
        completionFeedback: `As you approach 6th & Main, the vibrant energy of the place washes over you. The crows alight on the colorful shades nearby, their eyes reflecting the bustling scene below. The coffee shop stands as a beacon of Shelbyville's creative spirit, its windows offering glimpses of art-adorned walls and shelves lined with books.\n
        The aroma of freshly roasted coffee beans seems to carry whispers of countless conversations, each one a thread in the rich tapestry of local life. The cobblestone walkway beneath your feet feels alive with the echoes of music performances and community gatherings.\n
        Your corvid guides ruffle their feathers, as if sensing the blend of mundane and mystical energies swirling around this cultural hub. What role might this vibrant space play in the hidden narrative of Shelbyville? And what secrets could be hiding in plain sight, perhaps inscribed in the coffee rings left on well-worn tables?`,
        repeatable: true
      },
      {
        id: "17",
        type: "travel",
        title: "Chronicle of Shadows",
        description: `As dawn approaches, your corvid guides lead you through the lightening streets of Shelbyville.\n
        Their urgency is palpable as they guide you to your final destination. A rhythmic verse echoes in your mind:\n
      
        Where stories of Shelby take their form,\n
        In ink and paper, beyond the norm.\n
        A beacon of tales, both old and new,\n
        Chronicling life in every hue.\n
      
        Lens and pen unite with grace,\n
        To capture time in this hallowed space.\n
        Seek the source of county lore,\n
        Where life's rich tapestry finds its core.\n
      
        In heart of town, this bastion stands,\n
        Archiving tales of these storied lands.\n
        Find where Shelby's pulse beats strong,\n
        Where every life becomes a song.`,
        question: "Locate the epicenter of Shelby County's stories, where the past and present are immortalized in print.",
        targetLocation: {
          latitude: 38.21108477,
          longitude: -85.21632472
        },
        radius: 15,
        hints: [
          "Look for a place where Shelby's heartbeat is recorded in monthly installments.",
          "Seek the building where local shutterbugs and wordsmiths unite to tell the county's tales.",
          "Your destination shares its name with the very essence of Shelby it seeks to capture.",
          "The crows circle a structure where the county's triumphs and trials are forever etched in black and white."
        ],
        completionFeedback: "As you approach the Shelby County Life Magazine building, the first rays of sunlight begin to pierce the dissipating mist. Your crow companions alight on nearby branches, their mission nearly complete. The face of the building seems to hold the reflections of countless stories, each waiting to be told. What final revelation awaits you in this repository of local lore?",
        repeatable: true
      },
      {
        id: "18",
        type: "story",
        title: "Echoes of Shelby",
        storyText: `Standing before the Shelby County Life Magazine building, you feel the weight of your nocturnal journey pressing upon you.\n
        The crows that have been your faithful guides throughout this haunting adventure now perch silently, their dark eyes reflecting the rising sun.\n
        Each location pulses with the supernatural energy you've encountered, forming a tapestry of Shelby County's hidden history.\n
        The crows caw in unison, their voice carrying a final message:\n
      
        "Seeker of shadows, chronicler of the unseen,\n
        Your journey through Shelby's heart has been keen.\n
        From dusk till dawn, you've unraveled the thread,\n
        Of stories untold and secrets long dead.\n
      
        But remember, dear traveler, as night turns to day,\n
        The magic you've witnessed must not fade away.\n
        One task remains to seal this mystical tour,\n
        To ensure that these tales endure evermore.\n
        To complete your supernatural journey and immortalize your adventure, take a photo of yourself in front of the Shelby County Life Magazine logo.\n
        Post it on social media with the hashtags #CrowTours and #TrackingShadows.\n
        By doing so, you'll not only mark the end of your quest but also become a part of Shelby County's living history.\n
        Will you accept this final challenge and add your story to the chronicle of shadows?`,
        question: "",
        repeatable: true
      }
    ]
  }
];