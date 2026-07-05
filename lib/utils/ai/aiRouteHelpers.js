import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.models";

async function getProductAIInsight(productId, insightKey) {
  if (!productId) {
    return {
      status: 400,
      body: { error: "Product ID is required" },
    };
  }

  await connectToDB();

  const product = await Product.findById(productId).lean();

  if (!product) {
    return {
      status: 404,
      body: { error: "Product not found" },
    };
  }

  return {
    status: 200,
    body: product.aiInsights?.[insightKey] || null,
  };
}

export {
  getProductAIInsight,
};
