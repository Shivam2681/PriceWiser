import { generateAIResponse } from "@/lib/services/geminiClient.js";

export async function getAIProductSummary(productData) {
  const prompt = `
    Generate a professional product summary based on this data.
    
    Product: ${productData.title}
    Description: ${productData.description || "N/A"}
    Rating: ${productData.rating || "N/A"}
    Review Count: ${productData.reviewsCount || "N/A"}
    
    Return a JSON object with:
    {
      "summary": "A 2-3 sentence summary",
      "pros": ["list of pros"],
      "cons": ["list of cons"]
    }
  `;

  return await generateAIResponse(prompt);
}
