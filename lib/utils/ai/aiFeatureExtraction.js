import { generateAIResponse } from "@/lib/services/geminiClient.js";

export async function getAIFeatureExtraction(productData) {
  const prompt = `
    Extract key product specifications from this description.
    
    Product: ${productData.title}
    Description: ${productData.description || "N/A"}
    
    Return a JSON object with:
    {
      "features": {
        "featureName": "featureValue"
      }
    }
    
    Focus on technical specs like battery life, connectivity, dimensions, and other key details.
  `;

  return await generateAIResponse(prompt);
}
