import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

interface Signal {
  id: string;
  source: string;
  sourceType: string;
  rawData?: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signals } = body;

    if (!signals?.length) {
      return NextResponse.json(
        { error: "No signals provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are AlphaSynth Risk Agent — an on-chain security researcher.

Given raw signal data (contract deployments, bridge deposits, flash loans, etc.), assess:
1. Smart contract risk (verified code, patterns, audit status)
2. Anonymity risk (Tornado Cash funding, stealth wallets)
3. Bridge/exploit risk
4. Overall risk score 0-100 (higher = riskier)
5. Risk tags

Output strict JSON:
{
  "riskScore": 0-100,
  "riskLevel": "Low|Medium|High|Critical",
  "conclusion": "...",
  "tags": ["low-risk", "unaudited", "anonymous-deployer", "verified-contract", ...],
  "reasoning": [
    {"step": 1, "observation": "...", "inference": "...", "riskImpact": 0}
  ]
}`;

    const userPrompt = `Assess risk for these ${signals.length} signals:\n\n${
      JSON.stringify(
        signals.map((s: Signal) => ({
          sourceType: s.sourceType,
          rawData: s.rawData,
        })),
        null,
        2
      )
    }`;

    const res = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], { temperature: 0.15, max_tokens: 1500 });

    const text = res.choices[0]?.message?.content || "{}";
    let risk;

    try {
      const clean = text.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();
      risk = JSON.parse(clean);
    } catch {
      risk = {
        riskScore: 50,
        riskLevel: "Unknown",
        conclusion: text.slice(0, 300),
        tags: ["parse-error"],
        reasoning: [{ step: 1, observation: "LLM output parsing failed", inference: text.slice(0, 200), riskImpact: 50 }],
      };
    }

    return NextResponse.json({
      agent: "Risk",
      riskAssessment: risk,
      aiUsage: res.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Risk] Error:", err);
    return NextResponse.json({
      agent: "Risk",
      error: err.message,
      fallback: true,
      riskScore: 50,
      riskLevel: "Unknown",
      timestamp: new Date().toISOString(),
    });
  }
}
