import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export async function generateAIResponse(prompt) {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return null;
  }

  const maxRetries = 3;
  let retryCount = 0;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  while (retryCount < maxRetries) {
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
      // Check for Rate Limit Error (429)
      if (error.status === 429 || error.message?.includes('429')) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        console.warn(`Gemini Rate Limit (429). Retrying in ${Math.round(waitTime)}ms... (Attempt ${retryCount}/${maxRetries})`);
        await delay(waitTime);
        continue;
      }

      console.error("Gemini AI Error:", error);
      return null;
    }
  }
  
  return null;
}
