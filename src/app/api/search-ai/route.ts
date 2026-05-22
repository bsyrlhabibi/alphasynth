import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

// ── Routing Intelligence: AI determines which agent(s) to run ──
async function determineRouting(query: string): Promise<{
  agents: string[];
  intent: string;
  confidence: number;
}> {
  try {
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
  } catch (err: any) {
    console.warn("[SearchAI] Routing error:", err.message);
    return { agents: ["scout", "analyst"], intent: "general-research", confidence: 50 };
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

// ── Run Agent with signals (safe JSON parsing) ──
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

    // Safe JSON parsing - check if response is OK and has content
    if (!res.ok) {
      const text = await res.text().catch(() => "No response body");
      console.warn(`[SearchAI] Agent ${agent} returned ${res.status}:`, text.slice(0, 200));
      return { agent, error: `HTTP ${res.status}`, fallback: true };
    }

    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return { agent, error: "Empty response", fallback: true };
    }

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.warn(`[SearchAI] Agent ${agent} JSON parse failed:`, text.slice(0, 200));
      return { agent, error: "Invalid JSON response", fallback: true };
    }
  } catch (err: any) {
    console.warn(`[SearchAI] Agent ${agent} error:`, err.message);
    return { agent, error: err.message, fallback: true };
  }
}

// ── Main POST: AI Search ──
export async function POST(request: Request) {
  const start = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const query = body.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ 
        error: "Query is required",
        answer: { text: "Please enter a question to search.", confidence: 0 },
        mode: "error" 
      }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    const hasAI = !!process.env.AI_API_KEY;

    if (!hasAI) {
      return NextResponse.json({
        query,
        error: "AI not configured. Set AI_API_KEY env var.",
        answer: { 
          text: "AI search requires an API key. Please configure AI_API_KEY in your environment variables.", 
          confidence: 0 
        },
        mode: "demo",
      }, { status: 200 }); // Return 200 so frontend shows the message
    }

    // Step 1: Route the query with AI
    let routing = { agents: ["scout", "analyst"], intent: "general-research", confidence: 50 };
    try {
      routing = await determineRouting(query);
    } catch (err: any) {
      console.warn("[SearchAI] Routing failed, using default:", err.message);
    }
    const routingLatency = Date.now() - start;

    // Step 2: Fetch live signals
    let signals: any[] = [];
    try {
      signals = await fetchSignals();
    } catch (err: any) {
      console.warn("[SearchAI] Signal fetch failed:", err.message);
    }

    // Step 3: Run requested agents (skip if no signals)
    const agentResults: Record<string, any> = {};
    const agentsToRun = routing.agents || ["scout", "analyst"];

    if (signals.length > 0) {
      const agentPromises = agentsToRun.map(async (agent) => {
        const result = await runAgent(agent, signals, query, baseUrl);
        agentResults[agent] = result;
      });
      await Promise.all(agentPromises);
    }

    // Step 4: AI-powered final answer
    let finalAnswer: string | null = null;
    let finalConfidence = 0;

    // Try synthesize agent first
    if (agentResults["synthesize"]?.synthesis?.summary) {
      finalAnswer = agentResults["synthesize"].synthesis.summary;
      finalConfidence = agentResults["synthesize"].synthesis.finalConfidence || 75;
    }

    // If no synthesize, try direct AI answer
    if (!finalAnswer) {
      try {
        const signalContext = signals.length > 0
          ? `\n\nAvailable data:\n${signals.slice(0, 5).map((s) => `- ${s.title} (${s.sourceType})`).join("\n")}`
          : "\n\nNo live data available.";

        const answerRes = await chatCompletion([
          {
            role: "system",
            content: `You are AlphaSynth Research Assistant — a crypto intelligence AI. Answer questions concisely with actionable insights. Use markdown for formatting. Be helpful and specific.`,
          },
          {
            role: "user",
            content: `"${query}"${signalContext}`,
          },
        ], { temperature: 0.3, max_tokens: 1500 });

        finalAnswer = answerRes.choices[0]?.message?.content || "I couldn't generate an analysis. Please try a different question.";
        finalConfidence = 75;
      } catch (aiErr: any) {
        console.error("[SearchAI] AI answer failed:", aiErr.message);
        finalAnswer = `I'm having trouble connecting to the AI service right now. Error: ${aiErr.message}. Please try again in a moment.`;
        finalConfidence = 0;
      }
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
    console.error("[Search AI] Unhandled error:", err);
    
    return NextResponse.json({
      error: err.message || "Unknown error",
      answer: { 
        text: "An unexpected error occurred. Please try again.", 
        confidence: 0 
      },
      mode: "error",
      timestamp: new Date().toISOString(),
    }, { status: 200 }); // Return 200 so frontend shows the message
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
