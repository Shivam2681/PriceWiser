import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateGroqResponse } from "./groqClient.js";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function generateAIResponse(prompt) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing, trying Groq fallback...");
    return await generateGroqResponse(prompt);
  }

  const maxRetries = 2;
  let retryCount = 0;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  while (retryCount <= maxRetries) {
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
      // Check for Rate Limit Error (429) or Quota Error
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn(`Gemini Quota/Rate Limit reached (Attempt ${retryCount + 1}).`);
        
        if (retryCount < maxRetries) {
          retryCount++;
          const waitTime = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
          await delay(waitTime);
          continue;
        }

        // Final attempt failed, fallback to Groq
        console.log("Switching to Groq fallback...");
        return await generateGroqResponse(prompt);
      }

      console.error("Gemini AI Error:", error);
      return null;
    }
  }
  
  return null;
}
