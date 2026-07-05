import { NextResponse } from "next/server";
import { generateAndStoreAIInsights } from "@/lib/services/aiService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 60; // Increase timeout to 60 seconds for AI generation
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, forceRefresh } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const insights = await generateAndStoreAIInsights(productId, forceRefresh);

    if (!insights) {
      return NextResponse.json({ error: "Failed to regenerate AI insights" }, { status: 500 });
    }

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("AI Regenerate API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
