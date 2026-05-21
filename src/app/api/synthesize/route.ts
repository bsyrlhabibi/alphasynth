import { NextResponse } from "next/server";
import { mockOpportunities } from "@/lib/data/mock";

export async function GET() {
  const opportunities = await Promise.all(
    mockOpportunities.map(async (opp) => ({
      ...opp,
      synthesizedAt: new Date().toISOString(),
      recommendation: generateRecommendation(opp),
    }))
  );

  return NextResponse.json({
    opportunities,
    total: opportunities.length,
    byAction: countByAction(opportunities),
    timestamp: new Date().toISOString(),
  });
}

function generateRecommendation(opp: (typeof mockOpportunities)[number]): string {
  switch (opp.action) {
    case "Act":
      return "Immediate action required. This is a high-confidence signal with time-sensitive implications.";
    case "Monitor":
      return "Set up alerts and track developments. Good setup forming.";
    case "Research":
      return "Gather more signals before committing capital. Insufficient conviction.";
    case "Ignore":
      return "Low quality signal cluster. Not worth attention at this time.";
    default:
      return "Review required.";
  }
}

function countByAction(opps: typeof mockOpportunities) {
  return opps.reduce(
    (acc, opp) => {
      acc[opp.action] = (acc[opp.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
