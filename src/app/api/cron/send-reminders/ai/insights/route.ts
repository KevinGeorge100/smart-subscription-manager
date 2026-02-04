import { NextResponse } from "next/server";
import { generateAIInsights } from "@/ai/insights";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const insights = await generateAIInsights({
      subscriptions: body.subscriptions,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
