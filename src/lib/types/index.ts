export interface Signal {
  id: string;
  source: string;
  sourceType: "onchain" | "social" | "github" | "docs";
  title: string;
  description: string;
  rawData: Record<string, any>;
  timestamp: string;
}

export interface ReasoningStep {
  step: number;
  agent: string;
  observation: string;
  hypothesis: string;
  confidence: number;
}

export interface AgentOutput {
  agent: string;
  reasoning: ReasoningStep[];
  conclusion: string;
  confidence: number;
  tags: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  signals: Signal[];
  agentOutputs: AgentOutput[];
  finalScore: number;
  finalConfidence: number;
  action: "Monitor" | "Act" | "Ignore" | "Research";
  timestamp: string;
  chain: string;
  riskLevel: "Low" | "Medium" | "High";
}

export interface OpportunityCardProps {
  opportunity: Opportunity;
}

export interface AgentBadgeProps {
  agent: string;
  confidence: number;
}
