import { NextResponse } from "next/server";
import { mockOpportunities } from "@/lib/data/mock";

export async function GET() {
  const analystOutputs = mockOpportunities.map((opp) => {
    const analystOutput = opp.agentOutputs.find((a) => a.agent === "Analyst");
    return {
      opportunityId: opp.id,
      analysis: analystOutput || null,
      chain: opp.chain,
      category: opp.category,
      timestamp: opp.timestamp,
    };
  });

  return NextResponse.json({
    agent: "Analyst",
    analyses: analystOutputs,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { signals } = body;

  return NextResponse.json({
    agent: "Analyst",
    query: signals,
    reasoningChain: generateReasoning(signals),
    timestamp: new Date().toISOString(),
  });
}

function generateReasoning(signals: any[]) {
  return signals.map((signal, i) => ({
    step: i + 1,
    observation: `Detected ${signal.sourceType} signal: ${signal.title}`,
    hypothesis: `This pattern suggests ${inferPattern(signal)} activity.`,
    confidence: Math.floor(Math.random() * 30) + 70,
  }));
}

function inferPattern(signal: any): string {
  const title = signal.title.toLowerCase();
  if (title.includes("contract")) return "token launch";
  if (title.includes("bridge")) return "cross-chain movement";
  if (title.includes("flash")) return "exploit preparation";
  return "general activity";
}
