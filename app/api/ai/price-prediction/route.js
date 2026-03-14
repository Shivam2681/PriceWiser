import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { getAIPricePrediction } from "@/lib/utils/ai/aiPricePrediction.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectToDB();

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if prediction is cached (not older than 24h)
    const now = new Date();
    const lastUpdated = product.aiInsights?.pricePrediction?.lastUpdated;
    const isCacheValid = lastUpdated && (now.getTime() - lastUpdated.getTime()) < 24 * 60 * 60 * 1000;

    if (isCacheValid) {
      return NextResponse.json(product.aiInsights.pricePrediction);
    }

    // Call Gemini for prediction
    const prediction = await getAIPricePrediction(product);

    if (!prediction) {
      return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 });
    }

    // Cache the result in MongoDB
    product.aiInsights = {
      ...product.aiInsights,
      pricePrediction: {
        ...prediction,
        lastUpdated: now,
      },
    };

    await product.save();

    return NextResponse.json(product.aiInsights.pricePrediction);
  } catch (error) {
    console.error("AI Price Prediction API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
