import { cohereModel } from "./src/ai/models.ai.js";

try {
    const response = await cohereModel.invoke(
        "Explain binary search in one paragraph."
    );

    console.log("Cohere working:");
    console.log(response.text);
} catch (error: any) {
    console.error("Cohere failed:");
    console.error(error?.message || error);
}