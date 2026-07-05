import { NextResponse } from "next/server";
import { getProductAIInsight } from "@/lib/utils/ai/aiRouteHelpers";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const result = await getProductAIInsight(productId, "features");

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("AI Feature Extraction API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
