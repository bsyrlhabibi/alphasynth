import { NextResponse } from "next/server";
import { mockOpportunities } from "@/lib/data/mock";

// POST: Run full multi-agent pipeline with live AI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signals = body.signals;

    if (!signals?.length) {
      return NextResponse.json({ error: "No signals" }, { status: 400 });
    }

    const results: any[] = [];

    // Run agents sequentially (each calls their own AI endpoint)
    for (const signal of signals.slice(0, 5)) {
      // Scout
      const scoutRes = await fetch(
        new URL("/api/scout", request.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signals: [signal] }),
        }
      );
      const scout = await scoutRes.json();

      // Analyst
      const analystRes = await fetch(
        new URL("/api/analyst", request.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signals: [signal] }),
        }
      );
      const analyst = await analystRes.json();

      // Risk
      const riskRes = await fetch(
        new URL("/api/risk", request.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signals: [signal] }),
        }
      );
      const risk = await riskRes.json();

      // Synthesize
      const synthRes = await fetch(
        new URL("/api/synthesize", request.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scoutResult: scout,
            analystResult: analyst,
            riskResult: risk,
          }),
        }
      );
      const synthesis = await synthRes.json();

      results.push({
        signal: { id: signal.id, title: signal.title },
        scout,
        analyst,
        risk,
        synthesis,
      });
    }

    return NextResponse.json({
      pipeline: "full-multi-agent",
      signalsProcessed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Pipeline] Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// GET: dataset overview with mock data as baseline
export async function GET() {
  return NextResponse.json({
    mode: "ready",
    endpoint: "/api/pipeline",
    usage: "POST { signals: Signal[] }",
    fallbackData: true,
    opportunities: mockOpportunities.length,
    version: "v2.0-live-ai",
    timestamp: new Date().toISOString(),
  });
}
