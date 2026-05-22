import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoutResult, analystResult, riskResult } = body;

    if (!scoutResult || !analystResult) {
      return NextResponse.json(
        { error: "Missing required agent outputs" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are AlphaSynth Synthesize Agent — a portfolio decision engine.

Given outputs from Scout, Analyst, and Risk agents, produce:
1. Final aggregated confidence (0-100)
2. Recommended action: Act / Monitor / Research / Ignore
3. One-sentence summary
4. Tags
5. Audit trail (how each agent contributed)

Use this logic:
- Scout ≥ 85 AND Analyst ≥ 80 AND Risk ≤ 30 → "Act" (low risk, high signal)
- Scout ≥ 80 AND Analyst ≥ 75 → "Monitor"
- Otherwise → "Research" unless Risk ≥ 80 → "Ignore"

Output strict JSON:
{
  "finalConfidence": 0-100,
  "action": "Act|Monitor|Research|Ignore",
  "summary": "...",
  "tags": ["..."],
  "auditTrail": [
    {"agent": "Scout", "confidence": 0, "weight": "...", "impact": "..."}
  ]
}`;

    const scoutStr = JSON.stringify(scoutResult, null, 2);
    const analystStr = JSON.stringify(analystResult, null, 2);
    const riskStr = JSON.stringify(riskResult || { riskScore: 50 }, null, 2);

    const userPrompt = `Synthesize these agent outputs into final recommendation:

Scout: ${scoutStr}

Analyst: ${analystStr}

Risk: ${riskStr}`;

    const res = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.1, max_tokens: 1500 });

    const text = res.choices[0]?.message?.content || "{}";
    let synthesis;

    try {
      const clean = text.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();
      synthesis = JSON.parse(clean);
    } catch {
      synthesis = {
        finalConfidence: 60,
        action: "Research",
        summary: text.slice(0, 300),
        tags: ["parse-error"],
        auditTrail: [],
      };
    }

    return NextResponse.json({
      agent: "Synthesize",
      synthesis,
      aiUsage: res.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Synthesize] Error:", err);
    return NextResponse.json({
      agent: "Synthesize",
      error: err.message,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}

// GET for health/status check
export async function GET() {
  return NextResponse.json({
    agent: "Synthesize",
    status: "ready",
    version: "v2.0-ai",
    timestamp: new Date().toISOString(),
  });
}
