import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";
import { getAIProductSummary } from "@/lib/utils/ai/aiProductSummary.js";

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

    // Check if summary is cached (not older than 7 days)
    const now = new Date();
    const lastUpdated = product.aiInsights?.summary?.lastUpdated;
    const isCacheValid = lastUpdated && (now.getTime() - lastUpdated.getTime()) < 7 * 24 * 60 * 60 * 1000;

    if (isCacheValid) {
      return NextResponse.json(product.aiInsights.summary);
    }

    // Call Gemini for summary
    const summaryData = await getAIProductSummary(product);

    if (!summaryData) {
      return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
    }

    // Cache the result in MongoDB
    product.aiInsights = {
      ...product.aiInsights,
      summary: {
        ...summaryData,
        lastUpdated: now,
      },
    };

    await product.save();

    return NextResponse.json(product.aiInsights.summary);
  } catch (error) {
    console.error("AI Product Summary API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
