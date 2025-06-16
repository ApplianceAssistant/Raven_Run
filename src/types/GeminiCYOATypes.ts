
export interface StoryChoice {
    id: number;
    text: string;
  }
  
  export interface StoryResponseFormat {
    scenario: string;
    imagePrompt: string;
    choices: StoryChoice[];
    conclusion?: string;
  }
  
  export type GameState = 'welcome' | 'loading' | 'playing' | 'error' | 'ended';
  
  export enum AdventureTheme {
    FANTASY = "epic fantasy quest in a magical realm",
    SCIFI = "interstellar exploration on a mysterious alien planet",
    MYSTERY = "noir detective story in a rain-slicked 1940s city",
    HORROR = "survival horror in an isolated, cursed cabin",
    CYBERPUNK = "high-tech low-life adventure in a dystopian neon city",
    PIRATE = "treasure-hunting in a swashbuckling Caribbean setting",
  }
  
  export const THEME_DETAILS: { [key in AdventureTheme]: { name: string; icon?: string } } = {
    [AdventureTheme.FANTASY]: { name: "Fantasy Quest" },
    [AdventureTheme.SCIFI]: { name: "Sci-Fi Exploration" },
    [AdventureTheme.MYSTERY]: { name: "Noir Mystery" },
    [AdventureTheme.HORROR]: { name: "Survival Horror" },
    [AdventureTheme.CYBERPUNK]: { name: "Cyberpunk Dystopia" },
    [AdventureTheme.PIRATE]: { name: "Treasure Hunting" },
  };
  