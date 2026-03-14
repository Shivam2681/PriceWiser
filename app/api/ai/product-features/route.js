import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { getAIFeatureExtraction } from "@/lib/utils/ai/aiFeatureExtraction.js";

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

    // Check if features are cached (not older than 30 days)
    const now = new Date();
    const lastUpdated = product.aiInsights?.features?.lastUpdated;
    const isCacheValid = lastUpdated && (now.getTime() - lastUpdated.getTime()) < 30 * 24 * 60 * 60 * 1000;

    if (isCacheValid) {
      return NextResponse.json(product.aiInsights.features);
    }

    // Call Gemini for feature extraction
    const extractionResult = await getAIFeatureExtraction(product);

    if (!extractionResult || !extractionResult.features) {
      return NextResponse.json({ error: "Failed to extract features" }, { status: 500 });
    }

    // Cache the result in MongoDB
    product.aiInsights = {
      ...product.aiInsights,
      features: {
        specifications: extractionResult.features,
        lastUpdated: now,
      },
    };

    await product.save();

    return NextResponse.json(product.aiInsights.features);
  } catch (error) {
    console.error("AI Feature Extraction API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
