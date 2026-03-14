import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function generateAIResponse(prompt) {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return null;
  }

  try {
    const result = await model.generateContent([
      {
        text: `You are an AI assistant for an e-commerce price tracking platform called PriceWiser. 
        Analyze product data and return structured JSON insights. Never return text outside JSON.
        
        ${prompt}`,
      },
    ]);

    const response = result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}
