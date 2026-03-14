import { generateAIResponse } from "@/lib/services/geminiClient.js";

export async function getAIPricePrediction(productData) {
  const prompt = `
    Based on the following product data, predict the future price trend.
    
    Product: ${productData.title}
    Current Price: ${productData.currentPrice}
    Average Price: ${productData.averagePrice}
    Lowest Price: ${productData.lowestPrice}
    Highest Price: ${productData.highestPrice}
    Price History: ${JSON.stringify(productData.priceHistory.slice(-10))}
    
    Return a JSON object with:
    {
      "prediction": "A string explaining the trend",
      "expectedPrice": a number representing the likely next price,
      "confidence": a number between 0-100,
      "recommendation": one of ["BUY_NOW", "WAIT_FOR_DROP", "GOOD_DEAL", "OVERPRICED"]
    }
  `;

  return await generateAIResponse(prompt);
}
