import { getAIPricePrediction } from "@/lib/utils/ai/aiPricePrediction.js";
import { getAIProductSummary } from "@/lib/utils/ai/aiProductSummary.js";
import { getAIFeatureExtraction } from "@/lib/utils/ai/aiFeatureExtraction.js";
import Product from "@/lib/models/product.models";
import { connectToDB } from "@/lib/mongoose";
import mongoose from "mongoose";

/**
 * Generates all AI insights for a product and stores them in the database.
 * This should be called after a product is scraped or updated.
 * 
 * @param {string} productId - The ID of the product to process.
 * @param {boolean} forceRefresh - Whether to ignore existing cache and regenerate.
 */
export async function generateAndStoreAIInsights(productId, forceRefresh = false) {
  try {
    await connectToDB();
    const product = await Product.findById(productId);
    
    if (!product) {
      console.error(`[AI Service] Product not found: ${productId}`);
      return null;
    }

    console.log(`[AI Service] Generating insights for: ${product.title}`);
    const now = new Date();
    const insights = product.aiInsights || {};

    // 1. Price Prediction (Refresh if forced or older than 24h)
    const lastPrediction = insights.pricePrediction?.lastUpdated;
    if (forceRefresh || !lastPrediction || (now - lastPrediction) > 24 * 60 * 60 * 1000) {
      console.log(`[AI Service] Fetching Price Prediction...`);
      const prediction = await getAIPricePrediction(product);
      if (prediction) {
        insights.pricePrediction = { ...prediction, lastUpdated: now };
      }
    }

    // 2. Product Summary (Refresh if forced or missing)
    if (forceRefresh || !insights.summary?.content) {
      console.log(`[AI Service] Fetching Product Summary...`);
      const summaryResult = await getAIProductSummary(product);
      if (summaryResult) {
        // Map 'summary' from AI to 'content' in DB schema
        insights.summary = { 
          content: summaryResult.summary, 
          pros: summaryResult.pros, 
          cons: summaryResult.cons, 
          lastUpdated: now 
        };
      }
    }

    // 3. Feature Extraction (Refresh if forced or missing)
    if (forceRefresh || !insights.features?.specifications || insights.features.specifications.size === 0) {
      console.log(`[AI Service] Fetching Feature Extraction...`);
      const features = await getAIFeatureExtraction(product);
      if (features?.features) {
        insights.features = { specifications: features.features, lastUpdated: now };
      }
    }

    // Use direct MongoDB collection update to bypass any Mongoose schema issues
    await Product.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      { $set: { aiInsights: insights } }
    );
    
    console.log(`[AI Service] Successfully updated insights for: ${product.title}`);
    return insights;
  } catch (error) {
    console.error(`[AI Service] Error generating insights:`, error.message);
    return null;
  }
}
