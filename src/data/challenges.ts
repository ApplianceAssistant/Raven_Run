import { Challenge } from '../types/challengeTypes';

interface Game {
  id: number;
  gameId: string;
  user_id: number;
  is_public: boolean;
  name: string;
  description: string;
  dayOnly: boolean;
  challenges: Challenge[];
}

export const games: Game[] = [
  {
    id: 0,
    gameId: "5483BBLMEJ0",
    user_id: 1,
    is_public: true,
    name: "Tracking Shadows in Shelby County",
    description: `Welcome to Crow Tours' hunt: Tracking Shadows in Shelby County.\n
      As night falls, strange occurrences have been reported across this once-quiet rural community.\n
      Inexplicable sounds echo through abandoned barns, eerie figures drift between ancient trees, and an oppressive atmosphere blankets the county.\n
      Your mission: uncover the truth behind these supernatural disturbances.\n
      Armed with nothing but choice companions, your wits, and cryptic guides, you'll explore forgotten corners of Shelby County, solving riddles and following clues left by those who came before.\n
      But beware—you're not alone in your search. Something watches from the shadows, its presence marked only by the rustle of crow's wings and fleeting glimpses in the moonlight.\n
      Can you piece together the dark history before dawn breaks? Or will you become another whispered legend in this haunted land?\n
      The shadows are moving. The hunt begins now.`,
    dayOnly: false,
    challenges: [
      {
        id: '0',
        order: 1,
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
          longitude: -85.219853
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
        order: 2,
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
        id: '2',
        order: 3,
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
          correct: "As the name 'John' passes your lips, a warm breeze caresses your face, carrying the scent of autumn leaves and distant memories. The crows take flight, their wings beating a game westward. What new mysteries await in that direction?",
          incorrect: [
            "A mournful caw pierces the air. The crows shuffle restlessly, urging you to look closer at the stone.",
            "The wind whispers through the graveyard, carrying fragments of forgotten names. Two choices remain, which one echoes in eternity?",
            "The crows' eyes gleam with anticipation. Surely, this time, you'll uncover the truth etched in stone."
          ]
        },
        repeatable: true
      },
      {
        id: '3',
        order: 4,
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
        id: '4',
        order: 5,
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
        order: 6,
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
        order: 7,
        type: 'textInput',
        title: "The Road to Liquid Heights",
        description: `Standing before the towering water reservoir, you're struck by its imposing presence against the Simpsonville sky. The crows circle overhead, their caws seeming to form words on the wind:\n
      
          Beneath the titan's watchful gaze,\n
          A game winds through the morning haze.\n
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
        id: '7',
        order: 8,
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
        "id": '8',
        order: 9,
        "type": "textInput",
        "title": "A Spirit's Warning",
        "description": `Standing before the playhouse, a winter's chill grips your heart. A weathered poster flutters in an unseen breeze, its message unclear. As you approach, ghostly bells toll in your mind:\n
        A miser's heart turned cold as frost,\n
        Through spirits three, not all is lost.\n
        Past and present dance through night,\n
        Future's chains a fearsome sight.\n
        In Christmas snow his tale unfolds,\n
        As midnight's bell its message holds.\n
        Redemption waits with morning's light,\n
        For him who learns to set things right.`,
        "question": "What redemptive tale, brought to these boards anew, promises transformation as the night hours grew?",
        "correctAnswer": "Ebenezer",
        "hints": [
          "A Christmas tale of ghostly intervention and change of heart.",
          "Three spirits guide a lonely soul through time's corridor.",
          "Counting houses and chains of greed give way to generosity.",
          "God bless us, every one!"
        ],
        "feedbackTexts": {
          "correct": "As 'Ebenezer' echoes in the air, distant bells chime softly. Your crow guide shuffles closer, as if seeking warmth against winter's memory. The playhouse seems to glow with an inner light, promising tales of redemption and renewal within its walls.",
          "incorrect": [
            "A cold wind whispers past, carrying echoes of chains. Perhaps another moment's reflection will reveal the transformative tale's true name.",
            "Ghostly laughter mingles with the sound of counting coins. The correct answer awaits your next attempt, but choose wisely - the spirits grow impatient.",
            "Your crow guide pecks at frozen ground, like marking time's passage. Consider carefully and try again before the night's last bell tolls."
          ]
        },
        "repeatable": true
      },
      {
        id: '9',
        order: 10,
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
        id: '10',
        order: 11,
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
        id: '11',
        order: 12,
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
        id: '12',
        order: 13,
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
        id: '13',
        order: 14,
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
        id: '14',
        order: 15,
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
        id: '15',
        order: 16,
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
          "Find where cobblestone games lead to a canopy of colorful triangles, often alive with music.",
          "The crows circle a building where local flavors and local talent brew together in perfect harmony."
        ],
        completionFeedback: `As you approach 6th & Main, the vibrant energy of the place washes over you. The crows alight on the colorful shades nearby, their eyes reflecting the bustling scene below. The coffee shop stands as a beacon of Shelbyville's creative spirit, its windows offering glimpses of art-adorned walls and shelves lined with books.\n
        The aroma of freshly roasted coffee beans seems to carry whispers of countless conversations, each one a thread in the rich tapestry of local life. The cobblestone walkway beneath your feet feels alive with the echoes of music performances and community gatherings.\n
        Your corvid guides ruffle their feathers, as if sensing the blend of mundane and mystical energies swirling around this cultural hub. What role might this vibrant space play in the hidden narrative of Shelbyville? And what secrets could be hiding in plain sight, perhaps inscribed in the coffee rings left on well-worn tables?`,
        repeatable: true
      },
      {
        id: "16",
        order: 17,
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
        id: '17',
        order: 18,
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
  },
  {
    id: 1,
    gameId: 'B5483BBLMEJ2',
    user_id: 1,
    is_public: true,
    name: "Tides of Mystery in North County",
    description: `As fog rolls inland, it carries whispers of forgotten tales and untold histories.\n
      Between the rhythmic sounds of breaking waves and mission bells, a murder of crows takes wing - your mysterious guides through time.\n
      These wise corvids know the secrets of corridors where footsteps echo across centuries, the humble resting places of pioneers who built towns from dust and dreams, and grand theaters where phantom audiences still applaud.\n
      Each location holds a piece of North County's soul, waiting to be discovered by those clever enough to decode the riddles and brave enough to seek the truth.\n
      Follow the crows as they lead you down quiet games and busy streets, past ancient pepper trees and modern developments.\n
      Listen for the whispered clues in the ocean breeze, and watch for signs in the shadowy spaces between past and present.\n
      Your quest begins now. The crows are gathering, the fog is rolling in, and North County's mysteries are calling. Will you answer?`,
    dayOnly: false,
    challenges: [
      {
        id: '0',
        order: 1,
        type: 'travel',
        title: `Wave Walker`,
        description: `Stretched like a finger toward horizon's rim,\n
          Where wooden planks embrace Pacific air,\n
          Through changing tides both gentle and more grim,\n
          This sentinel strides waves without a care.\n
          
          Below, adventurers dance as nature swells,\n
          While patient hunters cast their hopes to fate,\n
          Each weathered board a thousand stories tells,\n
          Of sun and storm that shaped these games to date.\n
          
          The crows above join gulls in watchful flight,\n
          Where once an icon crowned this ocean trail,\n
          Now changed by fortune's fierce and burning might,\n
          Yet still this giant stands through storm and gale.`,
        question: `Find where land reaches boldly into sea, a wooden giant rising from the surf.`,
        targetLocation: {
          latitude: 33.204805,
          longitude: -117.235027
        },
        radius: 20,
        hints: [
          "Where Mission Ave meets an endless horizon",
          "Look for the wooden planks that stretch out over the Pacific Ocean",
          "Listen for the sound of waves crashing against pilings",
          "The crows circle a structure in the west where the ocean's vastness meets human ingenuity"
        ],
        completionFeedback: `A crow shares its perch with scanning pelicans, watching waves crash against the pier's sturdy pillars.\n
          Images of yesteryear float past like sea spray - horse-drawn carriages, Victorian bathers, WWII sailors, and modern surfers - all part of this endless dance where Oceanside meets the sea.\n
          Trace your fingers across the weathered names carved in the railings of this 1987 pier, each one a story of the families who built this community.\n
          Though recent flames claimed the iconic diner, the spirit of resilience remains unbroken.\n
          The crow takes wing toward your next challenge, soaring past where generations have written their stories in salt air and wooden planks.\n
          Time to follow its lead - more mysteries await along these historic shores.`,
        repeatable: true
      },
      {
        id: '1',
        order: 2,
        type: 'travel',
        title: `Stage of Time`,
        description: `Where Coast and Mission's games align,\n
          Art Deco beauty stands through time,\n
          With weathered brick and classic face,\n
          A landmark claims its rightful place.\n
          Blue lamps light the coastal way,\n
          Where stories live from day to day,\n
          The crows above keep watchful eye,\n
          On history's stage beneath the sky.\n
          Since nineteen-thirty-six they say,\n
          This hall has seen both work and play,\n
          From sailors' shows in years of war,\n
          To modern tales behind its door.\n
          Community's heart still beats within,\n
          Where curtains rise and tales begin,\n
          Beneath the marquee's gleaming light,\n
          Where past and present both unite.`,
        question: `Seek the historic theater where dark-winged crows gather above, guarding secrets of performances past and present.`,
        targetLocation: {
          latitude: 33.196377,
          longitude: -117.380081
        },
        radius: 15,
        hints: [
          "Look where Mission Avenue meets Coast Highway, where shadows lengthen at dusk",
          "Seek the twin-sided marquee that has guided theater-goers for generations",
          "This building dates to 1936 and remains an active community theater venue",
          "Built in 1936, local legends speak of performers who never truly left the stage"
        ],
        completionFeedback: `As you approach the Sunshine Brooks Theater, watchful crows observe from their perch above the iconic marquee, their presence a testament to the enduring spirit of this historic venue.\n
          Originally built in 1936, this theater served as entertainment for both civilians and military personnel during World War II, evolving through the decades to become a cherished community arts center.\n
          The crows take wing, circling once before heading east, where more historical treasures await your discovery in downtown Oceanside.`,
        repeatable: true
      },
      {
        id: '2',
        order: 3,
        type: 'travel',
        title: `The Valley King`,
        description: `White walls rise through morning haze,\n
          Where friendly ghosts spent countless days,\n
          A cross points high into the sky,\n
          While playful crows soar swooping by.\n

          They call it "King of Missions" here,\n
          Where bells still ring out crystal clear,\n
          Through garden, church, and sacred ground,\n
          Ancient secrets wait to be found.\n

          The oldest pepper tree still grows,\n
          Its branches dance as warm wind blows,\n
          Two centuries of stories sleep,\n
          In corridors both wide and deep.\n

          The padres walked these games of old,\n
          Now ravens guard their tales untold,\n
          Through arches curved with Spanish grace,\n
          Time slows within this peaceful place.`,
        question: `Find the location where the oldest pepper tree in California still stands, guarding the secrets of the King.`,
        targetLocation: {
          latitude: 33.231836,
          longitude: -117.319631
        },
        radius: 20,
        hints: [
          "The pepper tree near the entrance was planted in 1830 and still provides shade today.",
          "Seek the largest of all California missions.",
          "Look for the white walls and Spanish arches that mark the King of Missions.",
          "The crows circle a place where the bells still ring out, echoing through the valley."
        ],
        completionFeedback: `A curious crow glides down from its perch in the ancient bell tower, landing near the historic pepper tree as you discover Mission San Luis Rey.\n
          Its feathers gleam in the sunlight filtering through the tree's branches, the same branches that have provided shade to visitors for nearly 200 years.\n
          The tree's branches sway gently in the breeze, casting dappled shadows on the weathered adobe walls.\n
          The mission's bells chime softly, their crystal-clear tones echoing through the peaceful grounds, as they have since 1798.\n
          As you stand in the shade of the pepper tree, you feel the weight of centuries of history pressing down upon you.\n
          The crows take flight once more, their caws echoing through the courtyard as they guide you onward to your next destination.`,
        repeatable: true
      },
      {
        id: '3',
        order: 4,
        type: 'travel',
        title: `End of the Road`,
        description: `Down a simple earthen trail,\n
          Where time's harsh stories still prevail,\n
          Low stone markers dot the ground,\n
          In sacred silence, barely found.\n

          No marble angels guard this space,\n
          Just weathered stones set humble place,\n
          Where pioneers laid down their load,\n
          At journey's end of life's hard road.\n

          The mission bells still toll nearby,\n
          As eucalyptus pierce the sky,\n
          Their branches bend in coastal air,\n
          Above this ground of simple prayer.\n

          These souls who built our town from dust,\n
          Through drought and toil, in faith and trust,\n
          Now rest in peace without display,\n
          As mission bells mark close of day.`,
        question: `Find the humble pioneer cemetery where simple markers tell tales of our town's earliest settlers.\n
        (Note: This location is best visited during daylight hours)`,
        targetLocation: {
          latitude: 33.228511,
          longitude: -117.319447
        },
        radius: 20,
        hints: [
          "This unadorned cemetery sits atop a small knoll to the south.",
          "Look for a humble dirt game that whispers of forgotten footsteps - most pass by without seeing this turn into history.",
          "Between the sounds of modern traffic and mission bells, a narrow trail leads to those who built our town with calloused hands and iron will,",
          "Where eucalyptus stand like ancient sentinels, their shadows point to modest stones laid flat against the earth. Dragons live forever, not so little boys."
        ],
        completionFeedback: `A crow circles quietly overhead as you discover this modest final resting place of Oceanside's pioneers.\n
          No grand monuments mark their passing - just simple stones that speak of lives spent building a community from wilderness.\n
          mission bells echo across these grounds just as they did when these settlers walked the earth, marking time's passage over generations of hard work, determination, and faith.\n
          Each modest marker represents a story of perseverance.\n
          Your winged guide soars toward the mission towers, leaving you to reflect on the quiet dignity of this place where our town's founders rest in unpretentious peace, their legacy living on in the community they helped create.`,
        repeatable: true
      },
      {
        id: '4',
        order: 5,
        type: 'travel',
        title: `The River's Guardian`,
        description: `The crows glide low through morning air,\n
        Where concrete spans the sandy lair.\n
        A tale unfolds as wings take flight,\n
        Above the riverbed and at great height.\n
        
        Where Mission bells once marked the way,\n
        A sentinel guards the San Luis Rey.\n
        Born of progress, built with pride,\n
        When first machines crossed countryside.\n
        
        Through canyon walls and golden sand,\n
        This weathered crossing still does stand,\n
        Silent witness to days of old,\n
        Where stories of the past unfold.\n
        
        Her sturdy frame joins shore to shore,\n
        Above the wash from days of yore.\n
        What am I, this faithful friend,\n
        Where Mission Road and canyon blend?`,
        question: `Find the historic bridge where crows soar above the San Luis Rey River, guarding memories of travelers past.`,
        targetLocation: {
          latitude: 33.259975,
          longitude: -117.237880
        },
        radius: 20,
        hints: [
          "Look for the old bridge spanning the San Luis Rey River, where concrete arches tell tales of California's past",
          "Find where the crows circle above weathered railings, watching the river's endless journey below",
          "Seek the historic crossing where the old highway once carried travelers on their way to Mission San Luis Rey",
          "This bridge has watched over the river since the early days of automobiles, now standing as a peaceful pedestrian passage"
        ],
        completionFeedback: `As you approach the Historic San Luis Rey Bridge, your corvid guides circle gracefully above its weathered span, their calls echoing across the valley.\n
      The bridge stands as a testament to early California engineering, its solid frame a reminder of when the first automobiles ventured inland to the Mission.\n
      Below, the San Luis Rey River continues its ancient journey, while overhead, the crows beckon you onward to discover more hidden history.`,
        repeatable: true
      },
      {
        id: '5',
        order: 6,
        type: 'travel',
        title: `The Adobe's Secret`,
        description: `Where ancient oaks cast shadows deep,\n
          An adobe crown does secrets keep.\n
          In morning light, the story flows,\n
          As watching crows share what they know:\n
          
          From Luiseño wisdom old,\n
          Comes "Wakhavumi's" tale untold -\n
          Where frogs once sang by waters clear,\n
          A rancho rose in frontier year.\n
          
          Twenty-eight rooms of Spanish grace,\n
          In eighteen-fifty-two found its place.\n
          When Couts and Bandini's love did bring,\n
          Two cultures' hopes on wedding ring.\n
          
          Twin courtyards bask in golden light,\n
          Where history's walls still stand so bright.\n
          What am I, this proud domain,\n
          Where old California's dreams remain?`,
        question: `Find the historic adobe estate where Spanish and American traditions merged beneath the watchful eyes of crows.`,
        targetLocation: {
          latitude: 33.233780,
          longitude: -117.253636
        },
        radius: 20,
        hints: [
          "Look for the majestic adobe with its distinctive cupola tower rising above twin courtyards",
          "Find where stone-lined games lead to arched corridors, sheltered by ancient pepper trees",
          "Seek the 1852 rancho where Cave Couts built a twenty-eight room mansion for his bride Ysidora",
          "Your destination stands proud against the hills, its adobe walls and tile roofs telling tales of California's Mexican and American heritage"
        ],
        completionFeedback: `As you discover Rancho Guajome Adobe, the crows soar above its distinctive cupola, guardians of this historic 1852 estate.\n
        Here, Cave Johnson Couts created a magnificent home for his wife Ysidora Bandini, blending Mexican and American architectural traditions in twenty-eight elegant rooms.\n
        The crows guide your gaze across the twin courtyards, where the past lives on in every carefully preserved adobe brick and hand-laid tile.`,
        repeatable: true
      },
      {
        id: '6',
        order: 7,
        type: 'travel',
        title: `Stage of Stars`,
        description: `The crows lead on through evening's veil,\n
          Where drama's songs and laughter sail.\n
          A riddle floats on twilight air,\n
          As shadows dance without a care:\n
          
          In Brengle's park where hillsides rise,\n
          A stage joins earth and starlit skies.\n
          No walls contain the stories here,\n
          Where summer dreams bloom year by year.\n
          
          Since eighty-one, when darkness falls,\n
          These grounds become fair theater's halls.\n
          Orchestra swells and voices soar,\n
          While moonbeams dance on grassy floor.\n
          
          Where Shakespeare meets Broadway's bright ways,\n
          And picnics greet warm summer days.\n
          What am I, this twilight scene,\n
          Where stars above meet stars serene?`,
        question: `Find the location where performances come alive under the stars.`,
        targetLocation: {
          latitude: 33.211685,
          longitude: -117.221440
        },
        radius: 20,
        hints: [
          "Listen for phantom melodies of seasons past, where countless standing ovations have echoed through the eucalyptus trees.",
          "Follow your corvid guides as day surrenders to dusk, when stage lights rival the emerging stars.",
          "Seek the place where blankets spread on grassy slopes become front-row seats to magic.",
          "The crows know where music mingles with evening breezes, and where Broadway meets California nights."
        ],
        completionFeedback: `The crows settle briefly on the empty stage, as if preparing for their own performance.\n
        But they soon take wing once more, their shadows dancing across the seats like actors crossing the boards.\n
        What other enchanted spaces await discovery as your journey through Vista's treasures continues?`,
        repeatable: true,
      },
      {
        id: '7',
        order: 8,
        type: 'travel',
        title: `Hilltop Haven`,
        description: `Where art and nature dance in sunlit space,\n
        Upon the crown where city meets the sky,\n
        Each game reveals a new enchanting grace,\n
        As metal sculptures catch each passing eye.\n

        Through gardens themed from worlds both near and far,\n
        Mediterranean dreams to desert sand,\n
        The children's game leads to a wishful star,\n
        While butterflies paint beauty cross the land.\n

        The wise crows circle round the ancient tree,\n
        That marks the heart of this enlightened ground,\n
        Where peace bells ring with gentle harmony,\n
        And wisdom from the labyrinth is found.\n

        In Bonsai Court where time moves slow and sure,\n
        The masters' careful pruning tells its tale,\n
        While herbs and flowers offer nature's cure,\n
        Along the winding hilltop garden trail.`,
        question: `Follow the crows to find the location where art, nature, and tranquility converge on a hilltop sanctuary with panoramic views of Vista.`,
        targetLocation: {
          latitude: 33.210308,
          longitude: -117.219438
        },
        radius: 20,
        hints: [
          "Located at the highest point in Brengle Terrace Park",
          "Look for the metal dinosaur sculptures standing guard among the gardens.",
          `Seek out "The Three Kahunas," island-inspired sculptures watching over the gardens and the "Mouth of Truth" to test your way.`,
          "Listen for the gentle ring of peace bells and the laughter of children as you approach this hilltop sanctuary."
        ],
        completionFeedback: `A crow alights upon one of the garden's metal sculptures, its dark feathers contrasting with the gleaming artwork as late afternoon sun bathes the hilltop in golden light.\n
          You've discovered Alta Vista Gardens, Vista's living museum of botanical wonders and artistic expression.\n
          As the crow takes wing toward your next destination, it circles once around the meditation labyrinth, casting a fleeting shadow across its contemplative games.\n
          Take a moment to appreciate this unique blend of nature and human creativity before continuing your quest.`,
        repeatable: true
      },
      {
        id: '8',
        order: 9,
        type: 'travel',
        title: `Dewey's Vault`,
        description: `As twilight falls on Vista's streets,\n
          A gentle whisper your ears do greet.\n
          A rhyme unfolds, a playful guide,\n
          To knowledge's home, where wonders hide:\n
          
          In Vista's heart, a treasure stands,\n
          Where books are keys to far-off lands.\n
          Its walls, not stone, but welcoming sight,\n
          Hold stories that spark imagination's light.\n
          
          Shelves lined with tales of every kind,\n
          Adventures waiting for eager minds.\n
          Dewey's system, a friendly maze,\n
          Where curious souls spend countless days.\n
          
          Here, Twain's wit and Austen's grace,\n
          Coexist in this special place.\n
          In quiet corners, readers dream,\n
          Of worlds beyond, or so they seem.\n
          
          Not shop, nor home, this vibrant space,\n
          Where every visit leaves a trace.\n
          What am I, this vault of printed lore,\n
          Where minds can soar and spirits explore?`,
        question: `Journey to the location described in this riddle.`,
        targetLocation: {
          latitude: 33.202101,
          longitude: -117.232825
        },
        radius: 15,
        hints: [
          "Dewey's system guides you through a forest of stories, each shelf a new adventure.",
          "Seek the building where silence whispers knowledge, and every book opens a door to imagination.",
          "I'm where stories slumber, waiting to be awakened by curious eyes.",
          "Seek the building where silence whispers knowledge, and the musty scent of aged paper fills the air."
        ],
        completionFeedback: `Bravo! The library, though quiet, feels alive with the potential of unexplored worlds and untold tales.\n
        The crows settle on the rooftop and nearby trees, their dark eyes gleaming with intelligence as if they're the guardians of this literary sanctuary.\n
        As you stand before the entrance, you feel a gentle tug urging you onwards.\n
        The crows ruffle their feathers, preparing to take flight once more.\n
        Their restlessness hints that your journey through Vista's hidden wonders has only just begun, with more mysterious locations yet to uncover.`,
        repeatable: true,
      },
      {
        id: '9',
        order: 10,
        type: 'travel',
        title: 'Vista of Yesterday',
        description: `Crows soar high o'er ancient ground,\n
          Where Machado's dream was found.\n
          In eighteen-forty-five they say,\n
          These walls rose up in summer's sway.\n
          
          First a grant from Mexico's hand,\n
          Then became American land.\n
          Where sheep once grazed on hillsides green,\n
          And vaqueros' skills were seen.\n
          
          Cave Couts Junior's time came next,\n
          Adding rooms and broader specs.\n
          A trading post where tribes would meet,\n
          Where cultures merged on this retreat.\n
          
          From Luiseño games of old,\n
          To Spanish days and ranchlands bold,\n
          What am I, this treasured place,\n
          Where three worlds left their lasting grace?`,
        question: `Find the historic adobe where Native American, Spanish, and American histories intertwined beneath Vista's skies.`,
        targetLocation: {
          latitude: 33.204805,
          longitude: -117.235027
        },
        radius: 20,
        hints: [
          "Look for the adobe where Jesus Machado's 1845 vision still stands against the California sky",
          "Find where the old trading post once welcomed Luiseño traders and Spanish vaqueros alike",
          "Seek the ranch house where Cave Couts Jr expanded the original Mexican-era adobe",
          "Your destination tells the story of California's transition from Mexican land grant to American territory"
        ],
        completionFeedback: `As you discover Rancho Buena Vista Adobe, the crows circle this witness to California's transformative years.\n
        Built in 1845 by Jesus Machado on an original Mexican land grant, these walls have watched California change from Mexican territory to American state.\n
        The crows guide your eyes to the historic trading post where Luiseño people, Spanish settlers, and American pioneers once gathered, each adding their own chapter to this adobe's remarkable story.`,
        repeatable: true
      },
      {
        id: '10',
        order: 11,
        type: "story",
        title: "",
        storyText: `Congratulations, intrepid explorer! You've completed a remarkable journey through North County's hidden histories and sacred spaces.\n
          The crows that guided you have shared their ancient wisdom, revealing the layers of stories that make this land special - from the mighty Mission San Luis Rey to the humble pioneer cemetery, from historic adobes to modern gardens.\n
          Each stop on your journey has added a thread to the tapestry of North County's tale: Spanish missionaries and Luiseño traditions, Victorian travelers and vaqueros, actors and artists, pioneers and dreamers.\n
          Take a moment to reflect on all you've discovered. Perhaps gather your fellow adventurers for a group photo at your favorite location - your own moment of history in these historic places. Share your adventure with #CrowTours and join the community of explorers who've uncovered these hidden treasures.\n
          The crows circle one final time, their wings catching the golden California light. They seem to nod in approval - you've proven yourself worthy of the secrets they've shared. Though this journey ends, there are always more mysteries to uncover in North County's hidden corners.\n
          Until our games cross again, keep exploring, keep discovering, and keep sharing the stories of this remarkable land.`,
        question: "",
        repeatable: true
      }
    ]
  }
];