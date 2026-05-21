import { NextResponse } from "next/server";
import { mockSignals } from "@/lib/data/mock";

export async function GET() {
  const processedSignals = mockSignals.map((signal) => ({
    ...signal,
    analyzedAt: new Date().toISOString(),
    patternMatch: detectPattern(signal),
  }));

  return NextResponse.json({
    agent: "Scout",
    signals: processedSignals,
    totalSignals: processedSignals.length,
    timestamp: new Date().toISOString(),
  });
}

function detectPattern(signal: (typeof mockSignals)[number]): string[] {
  const patterns: string[] = [];
  const title = signal.title.toLowerCase();
  const desc = signal.description.toLowerCase();

  if (title.includes("contract") || desc.includes("deploy")) {
    patterns.push("new-contract");
  }
  if (title.includes("bridge") || desc.includes("bridge")) {
    patterns.push("bridge-activity");
  }
  if (title.includes("airdrop") || desc.includes("merkle")) {
    patterns.push("airdrop-signal");
  }
  if (title.includes("flash") || desc.includes("flash loan")) {
    patterns.push("flash-loan");
  }
  if (desc.includes("whale")) {
    patterns.push("whale-movement");
  }
  if (desc.includes("deleted") || desc.includes("leak")) {
    patterns.push("stealth-leak");
  }
  if (desc.includes("tornado")) {
    patterns.push("privacy-risk");
  }

  return patterns;
}
