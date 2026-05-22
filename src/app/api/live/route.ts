import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

// ── Live Data Fetchers (add more as API keys are added) ──

async function fetchDeFiLlama(): Promise<any[]> {
  try {
    const [protocols, yields] = await Promise.all([
      fetch("https://api.llama.fi/protocols", {
        headers: { "User-Agent": "AlphaSynth/2.0" },
        signal: AbortSignal.timeout(15000),
      }),
      fetch("https://yields.llama.fi/pools", {
        headers: { "User-Agent": "AlphaSynth/2.0" },
        signal: AbortSignal.timeout(15000),
      }),
    ]);

    const protocolsData = await protocols.json();
    const yieldsData = await yields.json();

    const topProtocols = (protocolsData || [])
      .slice(0, 5)
      .map((p: any) => ({
        source: "DeFiLlama",
        sourceType: "defi",
        title: `TVL Spike: ${p.name} (+${((p.change_1d || 0) * 100).toFixed(1)}% 24h)`,
        description: `TVL: $${(p.tvl / 1e6).toFixed(0)}M, Chains: ${p.chains?.join(", ") || "N/A"}`,
        rawData: { protocol: p.name, tvl: p.tvl, change1d: p.change_1d, chains: p.chains },
        timestamp: new Date().toISOString(),
      }))
      .filter((p: any) => Math.abs(p.rawData.change1d) > 0.05); // 5% change threshold

    const topYields = (yieldsData?.data || [])
      .slice(0, 5)
      .sort((a: any, b: any) => (b.apy || 0) - (a.apy || 0))
      .map((y: any) => ({
        source: "DeFiLlama Yields",
        sourceType: "yield",
        title: `Yield Opportunity: ${y.project} @ ${(y.apy * 100).toFixed(1)}% APY`,
        description: `TVL: $${(y.tvlUsd / 1e6).toFixed(1)}M, Chain: ${y.chain}, Symbol: ${y.symbol}`,
        rawData: { project: y.project, apy: y.apy, tvlUsd: y.tvlUsd, chain: y.chain },
        timestamp: new Date().toISOString(),
      }));

    return [...topProtocols, ...topYields];
  } catch (err) {
    console.warn("[Live/DeFiLlama]:", err);
    return [];
  }
}

async function fetchCoinGecko(): Promise<any[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/search/trending",
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await res.json();
    return (data.coins || []).slice(0, 10).map((c: any) => ({
      source: "CoinGecko Trending",
      sourceType: "market",
      title: `Trending: ${c.item.name} (${c.item.symbol}) — Rank #${c.item.market_cap_rank}`,
      description: `Market Cap Rank: ${c.item.market_cap_rank}, Score: ${c.item.score}`,
      rawData: {
        name: c.item.name,
        symbol: c.item.symbol,
        rank: c.item.market_cap_rank,
        id: c.item.id,
      },
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn("[Live/CoinGecko]:", err);
    return [];
  }
}

// ── AI-Powered Signal Enhancement ──
async function enhanceWithAI(signals: any[]): Promise<any[]> {
  try {
    const systemPrompt = `You are an alpha signal enhancer. Given raw crypto market signals, enhance them with:
1. Why this signal matters
2. What action traders should consider
3. A 0-100 urgency score

Output strict JSON array: [{ "id": "signal index", "whyMatters": "...", "suggestedAction": "...", "urgencyScore": 0 }]`;

    const res = await chatCompletion([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify(
          signals.map((s, i) => ({ id: i, title: s.title, description: s.description, source: s.source })),
          null,
          2
        ),
      },
    ], { temperature: 0.2, max_tokens: 2000, model: process.env.AI_MODEL_SMALL || undefined });

    const text = res.choices[0]?.message?.content || "[]";
    const clean = text.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();
    const enhancements = JSON.parse(clean);

    return signals.map((s, i) => {
      const enhancement = enhancements.find((e: any) => e.id === i);
      if (enhancement) {
        return {
          ...s,
          aiEnhancement: {
            whyMatters: enhancement.whyMatters,
            suggestedAction: enhancement.suggestedAction,
            urgencyScore: enhancement.urgencyScore,
          },
        };
      }
      return s;
    });
  } catch (err) {
    console.warn("[Live/AI-Enhance]:", err);
    return signals;
  }
}

// ── Main Route ──
export async function GET() {
  const hasAI = !!process.env.AI_API_KEY;
  const start = Date.now();

  // Fetch live data in parallel
  const fetchPromises = [fetchDeFiLlama(), fetchCoinGecko()];
  const [defiSignals, cgSignals] = await Promise.all(fetchPromises);

  let allSignals = [...defiSignals, ...cgSignals];

  // If AI is configured, enhance signals and add AI-generated insights
  if (hasAI && allSignals.length > 0) {
    allSignals = await enhanceWithAI(allSignals);
  }

  const fetchLatency = Date.now() - start;

  return NextResponse.json({
    mode: hasAI ? "live-ai" : "live-raw",
    signals: allSignals,
    totalSignals: allSignals.length,
    sources: {
      defiLlama: defiSignals.length,
      coinGecko: cgSignals.length,
    },
    fetchLatencyMs: fetchLatency,
    timestamp: new Date().toISOString(),
  });
}

// POST: manual signal ingest
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const externalSignals = body.signals || [];

    return NextResponse.json({
      mode: "manual-ingest",
      signals: externalSignals,
      totalSignals: externalSignals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
