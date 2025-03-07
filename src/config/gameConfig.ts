//src/config/gameConfig.ts

export interface GameConfig {
    difficulty_levels: {
      [key: string]: {
        name: string;
        description: string;
        icon: string;
      }
    };
    estimated_time_ranges: {
      [key: string]: {
        min: number;
        max: number | null;
        display: string;
      }
    };
    distance_ranges: {
      [key: string]: {
        min: number;
        max: number | null;
        display: string;
      }
    };
    tags: {
      [key: string]: {
        name: string;
        description: string;
        icon: string;
      }
    };
  }
  
  export const gameConfig: GameConfig = {
    difficulty_levels: {
      easy: {
        name: "Easy",
        description: "Suitable for beginners, minimal walking",
        icon: "hiking_easy"
      },
      moderate: {
        name: "Moderate",
        description: "Some walking required, basic puzzle solving",
        icon: "hiking"
      },
      challenging: {
        name: "Challenging",
        description: "Significant walking, complex puzzles",
        icon: "hiking_difficult"
      }
    },
    estimated_time_ranges: {
      short: { min: 0, max: 60, display: "Under 1 hour" },
      medium: { min: 60, max: 180, display: "1-3 hours" },
      long: { min: 180, max: 360, display: "3-6 hours" },
      epic: { min: 360, max: null, display: "6+ hours" }
    },
    distance_ranges: {
      walking: { min: 0, max: 2, display: "Walking Distance" },
      short: { min: 2, max: 5, display: "Short Trip" },
      medium: { min: 5, max: 10, display: "Medium Journey" },
      long: { min: 10, max: null, display: "Long Adventure" }
    },
    tags: {
      history: {
        name: "Historical",
        description: "Explore local history",
        icon: "history"
      },
      nature: {
        name: "Nature",
        description: "Outdoor adventure",
        icon: "park"
      },
      // Add more tags...
    }
  };