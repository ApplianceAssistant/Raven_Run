import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StoryResponseFormat, AdventureTheme, THEME_DETAILS } from '../types/GeminiCYOATypes';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export class GameService {
    private ai: GoogleGenAI;

    constructor() {
        if (!API_KEY) {
            console.error("CRITICAL: API_KEY environment variable not found. The application cannot function.");
            throw new Error("Gemini API Key (process.env.REACT_APP_GEMINI_API_KEY) is not configured. The game cannot start.");
        }
        this.ai = new GoogleGenAI({ apiKey: API_KEY });
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
        let jsonStr = responseText.trim();
        const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) {
            jsonStr = match[1].trim();
        }

        try {
            const parsed = JSON.parse(jsonStr);
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
            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            return this.parseStoryResponse(response.text);
        };
        return this.callApiWithRetries(apiCall);
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
            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            return this.parseStoryResponse(response.text);
        };
        return this.callApiWithRetries(apiCall);
    }

    async generateImage(imagePrompt: string): Promise<string> {
        const detailedPrompt = `${imagePrompt}, detailed illustration, vibrant colors, atmospheric lighting`;
        const apiCall = async () => {
            const response = await this.ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: detailedPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });

            if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
            throw new Error("Failed to generate image or no images returned.");
        };
        return this.callApiWithRetries(apiCall);
    }
}
