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
        const themeDetail = THEME_DETAILS[theme];
        const themeName = themeDetail?.name || 'a mysterious adventure';
        // Since 'theme' is of type AdventureTheme, it's guaranteed to be a string value of the enum.
        const themeDescription: string = theme;

        const prompt = `
            Start a new choose-your-own-adventure story.
            Theme: ${themeName} - ${themeDescription}.
            The user wants an engaging, interactive story where their choices matter.
            Generate the very first scenario of the story.
            The scenario should be a few sentences long.
            Provide a compelling image prompt relevant to the scenario.
            Offer 2-3 distinct choices for the user to make.
            Format the response as a single JSON object with the following structure:
            {
              "scenario": "<string>",
              "imagePrompt": "<string>",
              "choices": [{"id": <number>, "text": "<string>"}, ...]
            }
            Ensure choices are not empty. Ensure the JSON is valid.
        `;

        const apiCall = async () => {
            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });
            const textContent = response.text;
            if (typeof textContent !== 'string') {
                console.error("AI response text is undefined or not a string:", textContent);
                throw new Error("Failed to get valid text content from AI response.");
            }
            return this.parseStoryResponse(textContent);
        };
        return this.callApiWithRetries(apiCall);
    }

    async progressStory(previousScenario: string, chosenAction: string, theme: AdventureTheme): Promise<StoryResponseFormat> {
        const themeDetail = THEME_DETAILS[theme];
        const themeName = themeDetail?.name || 'a mysterious adventure';
        // Since 'theme' is of type AdventureTheme, it's guaranteed to be a string value of the enum.
        const themeDescription: string = theme;

        const prompt = `
            Continue a choose-your-own-adventure story.
            Theme: ${themeName} - ${themeDescription}.
            Previous scenario: "${previousScenario}"
            User's chosen action: "${chosenAction}"
            Generate the next scenario based on the user's choice.
            The scenario should be a few sentences long.
            Provide a compelling image prompt relevant to the new scenario.
            Offer 2-3 distinct choices for the user to make.
            If the story is naturally concluding, you can provide a "conclusion" field instead of choices.
            Format the response as a single JSON object with the following structure:
            {
              "scenario": "<string>",
              "imagePrompt": "<string>",
              "choices": [{"id": <number>, "text": "<string>"}, ...],
              "conclusion": "<string>" // Optional, only if the story ends
            }
            Ensure choices are not empty unless it's a conclusion.
            Ensure the JSON is valid. The scenario text should be engaging.
        `;
        
        const apiCall = async () => {
            const response: GenerateContentResponse = await this.ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: { responseMimeType: "application/json" }
            });
            const textContent = response.text;
            if (typeof textContent !== 'string') {
                console.error("AI response text is undefined or not a string:", textContent);
                throw new Error("Failed to get valid text content from AI response.");
            }
            return this.parseStoryResponse(textContent);
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

            if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image && response.generatedImages[0].image.imageBytes) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            }
            throw new Error("Failed to generate image or no images returned.");
        };
        return this.callApiWithRetries(apiCall);
    }

    async generateSpeech(text: string, voiceNameFromSettings: string = 'echo-en-us'): Promise<string> {
        // Using model and settings from the user's working Python streaming example
        const modelName = 'gemini-2.5-pro-preview-tts'; 
        const voiceNameForAPI = 'Zephyr'; // From Python example
        const inputText = text; // Or use a fixed test like "Good morning! Ready to start your day?"

        const apiCall = async () => {
            console.log(`Generating Google TTS (streaming) for: "${inputText.substring(0, 30)}..." with voice ${voiceNameForAPI} using model ${modelName}`);
            
            const requestPayload = {
                contents: [{ role: "user", parts: [{ text: inputText }] }], 
                generationConfig: {
                    // temperature: 1, // Optional, from Python example
                    responseModalities: ['audio'], // Lowercase, from Python example
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: voiceNameForAPI,
                            }
                        },
                    }
                }
            };

            const fullRequestObject = {
                model: modelName,
                ...requestPayload
            };

            console.log('Attempting Google TTS API call (streaming) with request:', JSON.stringify(fullRequestObject, null, 2));

            try {
                const stream = await this.ai.models.generateContentStream(fullRequestObject);
                let accumulatedAudioBase64 = "";

                for await (const chunk of stream) {
                    if (chunk.candidates && 
                        chunk.candidates.length > 0 && 
                        chunk.candidates[0].content && 
                        chunk.candidates[0].content.parts && 
                        chunk.candidates[0].content.parts.length > 0 && 
                        chunk.candidates[0].content.parts[0].inlineData && 
                        chunk.candidates[0].content.parts[0].inlineData.data) {
                        
                        accumulatedAudioBase64 += chunk.candidates[0].content.parts[0].inlineData.data;
                    } else if (chunk.text && chunk.text) { // Should not happen if only audio is requested
                        console.warn("TTS stream returned text chunk:", chunk.text);
                    }
                }

                if (accumulatedAudioBase64) {
                    console.log("Successfully streamed and accumulated audio data.");
                    return `data:audio/wav;base64,${accumulatedAudioBase64}`;
                } else {
                    console.error('No audio data found in stream.');
                    throw new Error('No audio data received from Google TTS stream.');
                }

            } catch (error) {
                console.error(`Error calling Google TTS streaming API with model ${modelName}:`, error);
                const silent_wav_base64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
                return `data:audio/wav;base64,${silent_wav_base64}`;
            }
        };

        return this.callApiWithRetries(apiCall);
    }
}

const gameService = new GameService();
export default gameService;
