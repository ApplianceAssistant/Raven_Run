import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { StoryResponseFormat, AdventureTheme, THEME_DETAILS } from '../types/GeminiCYOATypes';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export class GameService {
    private ai: GoogleGenerativeAI;

    constructor() {
        if (!API_KEY) {
            console.error("CRITICAL: API_KEY environment variable not found. The application cannot function.");
            throw new Error("Gemini API Key (process.env.REACT_APP_GEMINI_API_KEY) is not configured. The game cannot start.");
        }
        this.ai = new GoogleGenerativeAI(API_KEY);
    }

    private async callApiWithRetries<T,>(apiCall: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
        try {
            return await apiCall();
        } catch (error) {
            if (retries === 0) {
                console.error("API call failed after multiple retries:", error);
                throw error;
            }
            console.warn(`API call failed, retrying in ${delayMs / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            return this.callApiWithRetries(apiCall, retries - 1, delayMs * 2);
        }
    }

    private parseStoryResponse(responseText: string): StoryResponseFormat {
        // Simplified regex to find the JSON block without using lookbehind.
        const jsonMatch = responseText.match(/```json\n(\{[\s\S]*?\})\n```/);
        if (!jsonMatch || !jsonMatch[1]) {
            console.error("Could not find or parse JSON block in response:", responseText);
            throw new Error("The story took an unexpected turn. The format of the response was unreadable.");
        }
        const jsonString = jsonMatch[1];
        
        try {
            const parsed = JSON.parse(jsonString);
            // Validate structure
            if (typeof parsed.scenario !== 'string' ||
                typeof parsed.imagePrompt !== 'string' ||
                !Array.isArray(parsed.choices) ||
                (parsed.conclusion !== undefined && typeof parsed.conclusion !== 'string')) {
                console.error("Parsed JSON does not match StoryResponseFormat:", parsed);
                throw new Error("Received malformed story data from AI.");
            }
            // Ensure choices have id and text
            parsed.choices = parsed.choices.map((choice: any, index: number) => ({
                id: typeof choice.id === 'number' ? choice.id : index + 1,
                text: typeof choice.text === 'string' ? choice.text : "Invalid choice"
            }));

            return parsed as StoryResponseFormat;
        } catch (e) {
            console.error("Failed to parse JSON response from Gemini:", e, "Raw response:", responseText);
            throw new Error("Failed to understand the story continuation from AI.");
        }
    }

    async startGame(theme: AdventureTheme): Promise<StoryResponseFormat> {
        const prompt = `
            You are a master storyteller for a dynamic text adventure game.
            The user wants to start a new adventure with the theme: "${theme}".
            Provide an engaging opening scenario.
            Describe the scene vividly and atmospherically.
            Then, offer 2-4 distinct and interesting choices for the player to make.
            Format your response STRICTLY as a JSON object with the following structure:
            {
              "scenario": "Your detailed description of the current situation.",
              "imagePrompt": "A concise but evocative prompt (max 30 words) for an image generator, capturing the essence of the scenario (e.g., 'mystical forest path at dusk, fantasy art').",
              "choices": [
                {"id": 1, "text": "Choice 1 description"},
                {"id": 2, "text": "Choice 2 description"}
              ]
            }
            Ensure the JSON is valid. The scenario text should be engaging and draw the player in.
        `;

        const apiCall = async () => {
            const model = this.ai.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        };

        const rawResponse = await this.callApiWithRetries(apiCall);
        return this.parseStoryResponse(rawResponse);
    }

    async progressStory(previousScenario: string, chosenAction: string, theme: AdventureTheme): Promise<StoryResponseFormat> {
        const prompt = `
            You are a master storyteller for a dynamic text adventure game.
            The current theme is: "${theme}".
            The previous scenario was: "${previousScenario}"
            The player chose: "${chosenAction}"

            Continue the story based on this choice.
            Describe the new scene vividly and atmospherically.
            Offer 2-4 distinct and interesting choices for the player to make.

            As a storyteller, set the scene but don't be overly descriptive. Keep people engaged but don't be overly wordy.

            If the story reaches a natural conclusion (e.g., player wins, dies, or an adventure arc ends), set "choices" to an empty array and add a "conclusion" field to the JSON.
            The conclusion should be satisfying and reflect the player's journey.

            Format your response STRICTLY as a JSON object with the following structure:
            {
              "scenario": "Your detailed description of the new situation.",
              "imagePrompt": "A concise but evocative prompt (max 30 words) for an image generator, capturing the essence of the new scenario.",
              "choices": [
                {"id": 1, "text": "Choice 1 description"},
                {"id": 2, "text": "Choice 2 description"}
              ],
              "conclusion": "Optional: A message if the story ends here."
            }
            If there is no conclusion, omit the "conclusion" field.
            Ensure choices are not empty unless it's a conclusion.
            Ensure the JSON is valid. The scenario text should be engaging.
        `;
        
        const apiCall = async () => {
            const model = this.ai.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        };

        const rawResponse = await this.callApiWithRetries(apiCall);
        return this.parseStoryResponse(rawResponse);
    }

    async generateImage(prompt: string): Promise<string> {
        // This is a placeholder. The Gemini API for image generation (e.g., Imagen)
        // is separate and may require a different setup or library.
        // For now, we return a placeholder image URL.
        console.warn("Image generation is not implemented. Returning a placeholder.");
        return `https://placehold.co/600x400?text=${encodeURIComponent(prompt.substring(0, 50))}`;
    }
}
