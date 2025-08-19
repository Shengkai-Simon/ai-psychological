import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { Prisma } from '@prisma/client';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Calls the Gemini API to get a psychological analysis based on a detailed prompt.
 * It is specifically configured to return a JSON object.
 *
 * @param prompt - The detailed prompt containing user data and instructions.
 * @returns A JSON object containing the AI's analysis.
 */
export const getAiAnalysis = async (prompt: string): Promise<Prisma.JsonValue> => {
    console.log(`[Gemini Service] Sending analysis prompt to Gemini API.`);
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
            },
            safetySettings
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log(`[Gemini Service] Received raw response.`);

        // --- DETAILED LOGGING FOR DEMONSTRATION ---
        console.log("\n\n" + "=".repeat(80));
        console.log("==========     RECEIVED RAW RESPONSE FROM GEMINI AI     ==========");
        console.log("=".repeat(80));
        console.log(responseText);
        console.log("=".repeat(80));
        console.log("==========              END OF RAW RESPONSE             ==========");
        console.log("=".repeat(80) + "\n\n");
        // --- END OF DETAILED LOGGING ---
        
        // The response should be a valid JSON string, so we parse it before returning.
        return JSON.parse(responseText);

    } catch (error) {
        console.error("\n[ERROR] Gemini API call failed:", error);
        // We re-throw the error to be handled by the calling service (ReportService).
        throw error;
    }
};
