import { NextResponse } from "next/server";
import { mockOpportunities } from "@/lib/data/mock";

export async function GET() {
  const riskOutputs = mockOpportunities.map((opp) => {
    const riskOutput = opp.agentOutputs.find((a) => a.agent === "Risk");
    return {
      opportunityId: opp.id,
      risk: riskOutput || null,
      riskLevel: opp.riskLevel,
      timestamp: opp.timestamp,
    };
  });

  return NextResponse.json({
    agent: "Risk",
    riskAssessments: riskOutputs,
    timestamp: new Date().toISOString(),
  });
}
