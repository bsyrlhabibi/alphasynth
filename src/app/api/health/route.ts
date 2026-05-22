import { NextResponse } from "next/server";
import { checkAIHealth } from "@/lib/ai";
import { mockOpportunities } from "@/lib/data/mock";

export async function GET() {
  let aiStatus: { ok: boolean; latency: number; model?: string } | null = null;
  let aiError: string | null = null;

  try {
    aiStatus = await checkAIHealth();
  } catch (err: any) {
    aiError = err.message;
    aiStatus = { ok: false, latency: 0 };
  }

  return NextResponse.json({
    status: "operational",
    version: "2.0.0",
    endpoints: {
      scout: "/api/scout",
      analyst: "/api/analyst",
      risk: "/api/risk",
      synthesize: "/api/synthesize",
      pipeline: "/api/pipeline",
      health: "/api/health",
    },
    ai: {
      configured: !!aiStatus,
      healthy: aiStatus?.ok ?? false,
      latencyMs: aiStatus?.latency ?? null,
      model: aiStatus?.model ?? null,
      error: aiError,
    },
    data: {
      mockOpportunities: mockOpportunities.length,
      mode: process.env.AI_API_KEY ? "live-ai" : "demo",
    },
    timestamp: new Date().toISOString(),
  });
}
