import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signals = body.signals;

    if (!signals?.length) {
      return NextResponse.json(
        { error: "No signals provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are AlphaSynth Scout Agent — an on-chain intelligence gathering specialist.

Given raw signal data, you must:
1. Detect patterns across multiple signal types (on-chain, social, GitHub, docs)
2. Identify convergent signals (different sources pointing to same opportunity)
3. Rate confidence 0-100
4. Return structured JSON

Output strict JSON:
{
  "patterns": ["new-contract", "bridge-activity", "airdrop-signal", "whale-movement", "stealth-leak", "privacy-risk"],
  "convergentSignals": 0,
  "confidence": 0-100,
  "conclusion": "string",
  "tags": ["..."],
  "reasoning": [
    {"step": 1, "observation": "...", "inference": "...", "confidence": 0}
  ]
}`;

    const userPrompt = `Scan these ${signals.length} signals for patterns:\n\n${
      JSON.stringify(
        signals.map((s: any) => ({
          source: s.source,
          sourceType: s.sourceType,
          title: s.title,
          description: s.description,
        })),
        null,
        2
      )
    }`;

    const res = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.2, max_tokens: 1500 });

    const text = res.choices[0]?.message?.content || "{}";
    let scout;

    try {
      const clean = text.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();
      scout = JSON.parse(clean);
    } catch {
      scout = {
        patterns: [],
        convergentSignals: 0,
        confidence: 50,
        conclusion: text.slice(0, 300),
        tags: ["parse-error"],
        reasoning: [],
      };
    }

    return NextResponse.json({
      agent: "Scout",
      signalsAnalyzed: signals.length,
      analysis: scout,
      aiUsage: res.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Scout] Error:", err);
    return NextResponse.json({
      agent: "Scout",
      error: err.message,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}
