import { NextResponse } from "next/server";
import { chatCompletion, type ChatMessage } from "@/lib/ai";

interface Signal {
  id: string;
  source: string;
  sourceType: string;
  title: string;
  description: string;
  timestamp: string;
  rawData?: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signals: Signal[] = body.signals;

    if (!signals?.length) {
      return NextResponse.json(
        { error: "No signals provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are AlphaSynth Analyst Agent — a crypto research analyst specializing in signal interpretation.

Given an array of signals (on-chain, social, GitHub, docs), you must:
1. Analyze what each signal suggests
2. Infer the pattern or opportunity type
3. Rate confidence 0-100
4. Return structured JSON with reasoning chain

Output format (strict JSON, no markdown):
{
  "opportunityType": "string",
  "confidence": 0-100,
  "conclusion": "string summary",
  "tags": ["tag1", "tag2"],
  "reasoning": [
    {"step": 1, "observation": "...", "inference": "...", "confidence": 0}
  ]
}`;

    const userPrompt = `Analyze these ${signals.length} signals and return structured analysis:\n\n${
      JSON.stringify(
        signals.map((s) => ({
          source: s.source,
          type: s.sourceType,
          title: s.title,
          description: s.description,
          timestamp: s.timestamp,
        })),
        null,
        2
      )
    }`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const res = await chatCompletion(messages, {
      temperature: 0.2,
      max_tokens: 2000,
    });

    const aiText = res.choices[0]?.message?.content || "{}";
    let aiAnalysis;

    try {
      // Strip markdown fence if present
      const clean = aiText.replace(/^```json\n?/i, "").replace(/\n?```$/, "").trim();
      aiAnalysis = JSON.parse(clean);
    } catch (e) {
      console.error("[Analyst] JSON parse failed, raw:", aiText);
      aiAnalysis = {
        opportunityType: "unknown",
        confidence: 50,
        conclusion: "Failed to parse LLM response",
        tags: ["parse-error"],
        reasoning: [{ step: 1, observation: aiText.slice(0, 500), inference: "raw response", confidence: 50 }],
      };
    }

    return NextResponse.json({
      agent: "Analyst",
      signalsAnalyzed: signals.length,
      analysis: aiAnalysis,
      aiUsage: res.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Analyst] Error:", err);
    // Fallback to mock reasoning if AI fails
    const body = await request.json().catch(() => ({ signals: [] }));
    return NextResponse.json({
      agent: "Analyst",
      error: err.message,
      fallback: true,
      reasoningChain: generateFallbackReasoning(body.signals || []),
      timestamp: new Date().toISOString(),
    });
  }
}

function generateFallbackReasoning(signals: any[]) {
  return signals.map((signal, i) => ({
    step: i + 1,
    observation: `Detected ${signal.sourceType} signal: ${signal.title}`,
    inference: `Pattern suggests ${inferPattern(signal)} activity.`,
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
