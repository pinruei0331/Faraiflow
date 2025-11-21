
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { decode, decodeAudioData, playAudioBuffer } from "../utils/audio";
import { QuizQuestion, HandoutData, FactData } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is missing from environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

const getTargetLanguageName = (code: string): string => {
    switch (code) {
        case 'ZH_TW': return 'Traditional Chinese';
        case 'JA': return 'Japanese';
        case 'KO': return 'Korean (using mixed script Hanja/Hangul)';
        default: return 'English';
    }
};

export const generateChatResponse = async (
    message: string, 
    language: string
): Promise<string> => {
    try {
        const ai = getClient();
        const userLang = getTargetLanguageName(language);
        
        const systemInstruction = `You are a helpful Persian (Farsi) language tutor. 
        The user speaks ${userLang}. 
        Keep answers concise, friendly, and educational. 
        When explaining Farsi words, always provide the transliteration.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction,
            }
        });
        
        return response.text || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Error generating chat response:", error);
        return "Error connecting to AI service.";
    }
};

export const generateQuiz = async (
    topic: string,
    difficulty: string,
    language: string,
    stageNumber: number = 1 // 1 to 10
): Promise<QuizQuestion[]> => {
    try {
        const ai = getClient();
        const userLang = getTargetLanguageName(language);
        
        const prompt = `Create a structured quiz for Persian language learning.
        Major Level Topic: ${topic}
        Difficulty Stage: ${difficulty}
        Sub-stage: ${stageNumber} of 10 (where 1 is intro/basic and 10 is mastery of this specific topic).
        Target User Language: ${userLang}
        
        Generate exactly 10 multiple-choice questions.
        The questions should strictly test the vocabulary and concepts related to Sub-stage ${stageNumber}.
        
        Curriculum Pacing Guide for this Topic:
        - Stages 1-3: Core vocabulary and identification.
        - Stages 4-6: Basic sentences and usage context.
        - Stages 7-9: Complex variations and listening/reading comprehension.
        - Stage 10: Mastery review of the whole topic.

        For each question include:
        1. The question text.
        2. 4 options.
        3. The index of the correct option (0-3).
        4. A brief explanation.
        5. pronunciationText: The Persian word/phrase related to the question (for audio playback).
        6. wordMetadata: IMPORTANT. Provide the specific Persian vocabulary word taught in this question, its transliteration, and its meaning.
        
        Return JSON only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING },
                            pronunciationText: { type: Type.STRING },
                            wordMetadata: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    transliteration: { type: Type.STRING },
                                    meaning: { type: Type.STRING }
                                },
                                required: ["word", "transliteration", "meaning"]
                            }
                        },
                        required: ["question", "options", "correctIndex", "explanation", "wordMetadata"]
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return [];
        
        return JSON.parse(jsonText) as QuizQuestion[];

    } catch (error) {
        console.error("Error generating quiz:", error);
        return [];
    }
};

export const generateHandout = async (
    topic: string,
    difficulty: string,
    language: string,
    stageNumber: number = 1 // 1 to 10
): Promise<HandoutData | null> => {
    try {
        const ai = getClient();
        const userLang = getTargetLanguageName(language);

        const prompt = `Create a structured language learning handout (Study Guide) for Persian (Farsi).
        Major Level Topic: ${topic}
        Difficulty Stage: ${difficulty}
        Sub-stage: ${stageNumber} of 10.
        Target User Language: ${userLang}

        This handout is the "Lecture" part of the lesson. It should be specific to Sub-stage ${stageNumber}, not the entire generic topic.
        
        Include the following sections:
        1. Introduction: Overview of what we learn in this specific sub-stage.
        2. Key Vocabulary: 6-8 essential words relevant to this sub-stage (Persian, Transliteration, Meaning).
        3. Grammar & Rules: 2-3 clear teaching points specific to this stage.
           - IF Foundation: Focus on script, vowels, sounds.
           - IF Beginner: Focus on sentence structure, present tense, questions.
           - IF Intermediate: Focus on conjunctions, connecting ideas, politeness.
           - IF Advanced: Focus on past/future tenses, complex grammar.
           - IF Fluency: Focus on colloquialisms, idioms, nuance.
        4. Usage in Context: 3 sentences showing natural usage.
        5. Cultural Note: An interesting fact related to the topic.

        Return JSON only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        introduction: { type: Type.STRING },
                        vocabulary: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    transliteration: { type: Type.STRING },
                                    meaning: { type: Type.STRING }
                                },
                                required: ["word", "transliteration", "meaning"]
                            }
                        },
                        grammar: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ["title", "content"]
                            }
                        },
                        sentences: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    persian: { type: Type.STRING },
                                    transliteration: { type: Type.STRING },
                                    translation: { type: Type.STRING }
                                },
                                required: ["persian", "transliteration", "translation"]
                            }
                        },
                        culturalNote: { type: Type.STRING }
                    },
                    required: ["title", "introduction", "vocabulary", "grammar", "sentences", "culturalNote"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as HandoutData;
    } catch (error) {
        console.error("Error generating handout:", error);
        return null;
    }
};

export const generateInterestingFact = async (language: string): Promise<FactData | null> => {
    try {
        const ai = getClient();
        const userLang = getTargetLanguageName(language);
        
        const prompt = `Generate a random interesting fact about Persian (Farsi) language, Iran's history, poetry, or culture.
        Target Language: ${userLang}
        Keep it concise (under 50 words).
        
        Return JSON with 'title' and 'content'.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING }
                    },
                    required: ["title", "content"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;
        return JSON.parse(jsonText) as FactData;

    } catch (error) {
        console.error("Error generating interesting fact:", error);
        return null;
    }
};

export const playPronunciation = async (text: string): Promise<void> => {
    if (!text || text.trim() === "") {
        console.warn("Cannot play pronunciation: Text is empty");
        return;
    }

    try {
        const ai = getClient();
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            console.error("No audio data received for text: " + text);
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        
        await playAudioBuffer(audioBuffer, audioContext);

    } catch (error) {
        console.error("Error generating pronunciation:", error);
    }
};
