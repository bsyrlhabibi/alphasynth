import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

// ── Routing Intelligence: AI determines which agent(s) to run ──
async function determineRouting(query: string): Promise<{
  agents: string[];
  intent: string;
  confidence: number;
}> {
  const systemPrompt = `You are AlphaSynth Query Router. Analyze the user's natural language search query and determine:
1. Which agents should handle this query (scout, analyst, risk, synthesize)
2. What is the user's intent (e.g. find-airdrop, check-risk, whale-tracking, yield-hunt, market-sentiment)
3. Confidence 0-100

Output strict JSON:
{
  "agents": ["scout", "analyst", "risk", "synthesize"],
  "intent": "string",
  "confidence": 0-100
}`;

  const res = await chatCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: `Query: "${query}"` },
  ], { temperature: 0.1, max_tokens: 500 });

  const text = res.choices[0]?.message?.content || "{}";
  const clean = text.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    // Fallback: default to full pipeline
    return { agents: ["scout", "analyst", "risk", "synthesize"], intent: "general-research", confidence: 50 };
  }
}

// ── Fetch Live Signals for AI Analysis ──
async function fetchSignals(): Promise<any[]> {
  try {
    const [liveRes, trendingRes] = await Promise.all([
      fetch("https://api.llama.fi/protocols", { signal: AbortSignal.timeout(15000) }),
      fetch("https://api.coingecko.com/api/v3/search/trending", { signal: AbortSignal.timeout(10000) }),
    ]);

    const protocols = await liveRes.json();
    const trending = await trendingRes.json();

    const protocolSignals = (protocols || [])
      .slice(0, 5)
      .map((p: any, i: number) => ({
        id: `protocol-${i}`,
        source: "DeFiLlama",
        sourceType: "defi",
        title: `${p.name} TVL: $${(p.tvl / 1e6).toFixed(0)}M (${((p.change_1d || 0) * 100).toFixed(1)}% 24h)`,
        description: p.chains?.join(", ") || "N/A",
      }));

    const trendSignals = (trending.coins || [])
      .slice(0, 5)
      .map((c: any, i: number) => ({
        id: `trending-${i}`,
        source: "CoinGecko",
        sourceType: "market",
        title: `${c.item.name} (${c.item.symbol}) Rank #${c.item.market_cap_rank}`,
        description: `Score: ${c.item.score}`,
      }));

    return [...protocolSignals, ...trendSignals];
  } catch (err) {
    console.warn("[SearchAI] fetchSignals error:", err);
    return [];
  }
}

// ── Run Agent with signals ──
async function runAgent(
  agent: string,
  signals: any[],
  query: string,
  baseUrl: string
): Promise<any> {
  try {
    const res = await fetch(`${baseUrl}/api/${agent}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signals, query }),
    });
    return await res.json();
  } catch (err: any) {
    return { agent, error: err.message, fallback: true };
  }
}

// ── Main POST: AI Search ──
export async function POST(request: Request) {
  const start = Date.now();

  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    const hasAI = !!process.env.AI_API_KEY;

    if (!hasAI) {
      return NextResponse.json({
        query,
        error: "AI not configured. Set AI_API_KEY env var.",
        mode: "demo",
      }, { status: 503 });
    }

    // Step 1: Route the query with AI
    const routing = await determineRouting(query);
    const routingLatency = Date.now() - start;

    // Step 2: Fetch live signals
    const signals = await fetchSignals();

    // Step 3: Run requested agents in parallel
    const agentResults: Record<string, any> = {};
    const agentsToRun = routing.agents || ["scout", "analyst", "risk", "synthesize"];

    const agentPromises = agentsToRun.map(async (agent) => {
      const result = await runAgent(agent, signals, query, baseUrl);
      agentResults[agent] = result;
    });

    await Promise.all(agentPromises);

    // Step 4: AI-powered final synthesis (if not already done)
    let finalAnswer: string | null = null;
    let finalConfidence = 0;

    if (agentsToRun.includes("synthesize") && agentResults["synthesize"]) {
      finalAnswer = agentResults["synthesize"].synthesis?.summary || null;
      finalConfidence = agentResults["synthesize"].synthesis?.finalConfidence || 0;
    }

    // If no synthesize agent or pipeline failed, do direct AI answer
    if (!finalAnswer) {
      const answerRes = await chatCompletion([
        {
          role: "system",
          content: `You are AlphaSynth Research Assistant. Answer crypto questions concisely with actionable insights. Use markdown for formatting.`,
        },
        {
          role: "user",
          content: `"${query}"\n\nAvailable data:\n${signals.slice(0, 5).map((s) => `- ${s.title} (${s.sourceType})`).join("\n")}`,
        },
      ], { temperature: 0.3, max_tokens: 1500 });

      finalAnswer = answerRes.choices[0]?.message?.content || "No analysis available.";
      finalConfidence = 75;
    }

    const totalLatency = Date.now() - start;

    return NextResponse.json({
      query,
      mode: "live-ai",
      routing: {
        intent: routing.intent,
        agentsUsed: agentsToRun,
        confidence: routing.confidence,
        routingLatencyMs: routingLatency,
      },
      agentResults,
      signals: signals.slice(0, 5),
      answer: {
        text: finalAnswer,
        confidence: finalConfidence,
      },
      latencyMs: totalLatency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Search AI] Error:", err);
    const fallbackAnswer = `I had trouble analyzing "${(await request.clone().json())?.query || "your question"}" right now. Try asking about specific tokens, airdrops, or market trends.`;

    return NextResponse.json(
      {
        error: err.message,
        answer: { text: fallbackAnswer, confidence: 0 },
        mode: "error-fallback",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

// GET: endpoint info
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/search-ai",
    purpose: "Natural language AI search across crypto signals",
    usage: 'POST { "query": "your question" }',
    examples: [
      { query: "airdrop clues minggu ini", description: "Find airdrop signals" },
      { query: "whale deposit ke bridge apa?", description: "Track whale movements" },
      { query: "yield farming ETH tertinggi", description: "Find best yields" },
    ],
    responseFormat: {
      query: "string",
      answer: { text: "string", confidence: 0 },
      routing: { intent: "string", agentsUsed: ["scout"], confidence: 0 },
      signals: ["array"],
    },
  });
}
