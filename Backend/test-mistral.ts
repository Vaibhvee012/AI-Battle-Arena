import { mistralAIModel } from "./src/ai/models.ai.js";

import dotenv from "dotenv";

dotenv.config();

console.log(
    "Mistral key loaded:",
    process.env.MISTRAL_API_KEY ? "YES" : "NO"
);

try {
    console.log("Sending request to Mistral...");

    const response = await mistralAIModel.invoke(
        "Explain binary search in one paragraph."
    );

    console.log("Mistral working:");
    console.log(response.text);
} catch (error: any) {
    console.error("Mistral failed:");
    console.error(error?.message || error);
}