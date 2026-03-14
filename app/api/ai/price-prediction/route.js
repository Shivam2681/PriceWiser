import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectToDB();
    const product = await Product.findById(productId).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product.aiInsights?.pricePrediction || null);
  } catch (error) {
    console.error("AI Price Prediction API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
