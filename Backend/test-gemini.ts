import { geminiModel } from "./src/ai/models.ai.js";

console.log("Starting Gemini test...");
console.log(
    "Gemini key loaded:",
    process.env.GOOGLE_API_KEY ? "YES" : "NO"
);

try {
    console.log("Sending request to Gemini...");

    const response = await Promise.race([
        geminiModel.invoke("Explain binary search in one paragraph."),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini request timed out after 30 seconds")), 30000)
        )
    ]);

    console.log("Gemini working:");
    console.log((response as any).text);
} catch (error: any) {
    console.error("Gemini failed:");
    console.error(error?.message || error);
}