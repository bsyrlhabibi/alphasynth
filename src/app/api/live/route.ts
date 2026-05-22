import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

// ── API Config ──
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// ── Alchemy: Whales + New Contracts ──
async function fetchAlchemyWhales(): Promise<any[]> {
  if (!ALCHEMY_API_KEY) return [];
  try {
    // Fetch recent large ETH transfers (mainnet)
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [
            {
              fromBlock: "0x" + (await getLatestBlock() - 100).toString(16),
              toBlock: "latest",
              category: ["external", "erc20"],
              withMetadata: true,
              excludeZeroValue: true,
              maxCount: "0x14", // 20
              order: "desc",
            },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      }
    );
    const data = await res.json();
    const transfers = data.result?.transfers || [];

    return transfers
      .filter((t: any) => {
        const value = t.value ? Number(t.value) / 1e18 : 0;
        return value > 100; // >100 ETH
      })
      .slice(0, 10)
      .map((t: any) => {
        const value = t.value ? Number(t.value) / 1e18 : 0;
        const symbol = t.asset === "ETH" ? "ETH" : (t.asset || "TOKEN");
        return {
          source: "Alchemy Whales",
          sourceType: "onchain-whale",
          title: `🐋 Whale Move: ${value.toFixed(1)} ${symbol} on ${t.metadata?.blockTimestamp?.slice(0, 10) || "recent"}`,
          description: `From ${t.from?.slice(0, 10)}... → ${t.to?.slice(0, 10)}... via ${t.category}`,
          rawData: {
            from: t.from,
            to: t.to,
            value: t.value,
            asset: t.asset,
            hash: t.hash,
            category: t.category,
          },
          timestamp: new Date().toISOString(),
        };
      });
  } catch (err) {
    console.warn("[Live/Alchemy]:", err);
    return [];
  }
}

async function getLatestBlock(): Promise<number> {
  try {
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
        signal: AbortSignal.timeout(5000),
      }
    );
    const data = await res.json();
    return parseInt(data.result, 16);
  } catch {
    return 22000000; // fallback
  }
}

// ── Alchemy: Latest Blocks Activity ──
async function fetchAlchemyActivity(): Promise<any[]> {
  if (!ALCHEMY_API_KEY) return [];
  try {
    // Get latest block
    const blockRes = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBlockByNumber",
          params: ["latest", false],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    const blockData = await blockRes.json();
    const block = blockData.result || {};
    const txCount = block.transactions?.length || 0;
    const gasUsed = parseInt(block.gasUsed || "0", 16);
    const gasLimit = parseInt(block.gasLimit || "0", 16);
    const utilization = gasLimit > 0 ? (gasUsed / gasLimit * 100).toFixed(1) : "0";

    return [
      {
        source: "Alchemy Block",
        sourceType: "onchain-block",
        title: `⛓️ Latest Block #${parseInt(block.number || "0", 16)}: ${txCount} txns, ${utilization}% gas`,
        description: `Gas used: ${(gasUsed / 1e6).toFixed(1)}M / ${(gasLimit / 1e6).toFixed(1)}M. Network ${Number(utilization) > 90 ? "🔥 hot" : Number(utilization) > 60 ? "warm" : "normal"}.`,
        rawData: {
          blockNumber: parseInt(block.number || "0", 16),
          txCount,
          gasUsed,
          gasLimit,
          utilization: Number(utilization),
        },
        timestamp: new Date().toISOString(),
      },
    ];
  } catch (err) {
    console.warn("[Live/Alchemy-Activity]:", err);
    return [];
  }
}

// ── Alchemy: Token Balances (for tracked wallets) ──
async function fetchAlchemyTokens(): Promise<any[]> {
  if (!ALCHEMY_API_KEY || !ETHERSCAN_API_KEY) return [];
  try {
    // Fetch top ERC20 transfers in last 24h via Alchemy
    const res = await fetch(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getTokenBalances",
          params: [
            "vitalik.eth", // Vitalik as example
            "erc20",
          ],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    const data = await res.json();

    if (data.result?.tokenBalances?.length) {
      const nonZero = data.result.tokenBalances.filter(
        (t: any) => t.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      if (nonZero.length > 0) {
        return [
          {
            source: "Alchemy Tokens",
            sourceType: "onchain-token",
            title: `Vitalik holds ${nonZero.length} ERC20 tokens`,
            description: `Track notable wallet token holdings. ${nonZero.slice(0, 3).map((t: any) => `${t.contractAddress?.slice(0, 6)}...`).join(", ")}...`,
            rawData: { wallet: "vitalik.eth", tokenCount: nonZero.length },
            timestamp: new Date().toISOString(),
          },
        ];
      }
    }
    return [];
  } catch (err) {
    console.warn("[Live/Alchemy-Tokens]:", err);
    return [];
  }
}

// ── Existing Fetchers ──

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
      .filter((p: any) => Math.abs(p.rawData.change1d) > 0.05);

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
    const systemPrompt = `You are an alpha signal enhancer for the AlphaSynth crypto intelligence engine.

Given raw crypto market signals (DeFi, whales, trending tokens, network activity), you MUST enhance each signal with:
1. whyMatters: 1-2 sentences on why this is an alpha signal
2. suggestedAction: one of "monitor", "research", "act", "ignore"
3. urgencyScore: 0-100 (90+ = immediate, 70+ = today, 50+ = this week)

Respond ONLY with a valid JSON array matching signal indices:
[{"id": 0, "whyMatters": "...", "suggestedAction": "monitor", "urgencyScore": 75}]`;

    const res = await chatCompletion([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify(
          signals.slice(0, 8).map((s, i) => ({
            id: i,
            title: s.title,
            description: s.description,
            sourceType: s.sourceType,
          })),
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
  const hasAlchemy = !!ALCHEMY_API_KEY;
  const start = Date.now();

  // Fetch ALL data sources in parallel
  const fetchPromises = [
    fetchDeFiLlama(),
    fetchCoinGecko(),
    hasAlchemy ? fetchAlchemyWhales() : Promise.resolve([]),
    hasAlchemy ? fetchAlchemyActivity() : Promise.resolve([]),
    hasAlchemy ? fetchAlchemyTokens() : Promise.resolve([]),
  ];

  const [defiSignals, cgSignals, whaleSignals, blockSignals, tokenSignals] =
    await Promise.all(fetchPromises);

  let allSignals = [
    ...defiSignals,
    ...cgSignals,
    ...whaleSignals,
    ...blockSignals,
    ...tokenSignals,
  ];

  // Sort by timestamp (most recent first), then by AI urgency
  if (hasAI && allSignals.length > 0) {
    allSignals = await enhanceWithAI(allSignals);
    // Sort: AI-enhanced signals with high urgency first
    allSignals.sort((a: any, b: any) => {
      const ua = a.aiEnhancement?.urgencyScore || 0;
      const ub = b.aiEnhancement?.urgencyScore || 0;
      return ub - ua;
    });
  }

  const fetchLatency = Date.now() - start;

  return NextResponse.json({
    mode: hasAI ? "live-ai" : "live-raw",
    signals: allSignals,
    totalSignals: allSignals.length,
    sources: {
      defiLlama: defiSignals.length,
      coinGecko: cgSignals.length,
      alchemyWhales: whaleSignals.length,
      alchemyBlocks: blockSignals.length,
      alchemyTokens: tokenSignals.length,
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
