// AI Client with configurable baseUrl + apiKey
// Defaults to OpenAI-compatible format, works with OpenRouter, Groq, local, etc.

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: any;
}

function getEnvConfig(): AIConfig {
  const baseUrl = process.env.NEXT_PUBLIC_AI_BASE_URL || process.env.AI_BASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || process.env.AI_API_KEY;
  const model = process.env.NEXT_PUBLIC_AI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";

  if (!baseUrl) {
    throw new Error("AI_BASE_URL not set. Provide a custom AI endpoint (e.g. OpenRouter, Groq, local Ollama).");
  }
  if (!apiKey) {
    throw new Error("AI_API_KEY not set. Provide an API key for the configured endpoint.");
  }

  return { baseUrl, apiKey, model };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    config?: AIConfig;
  }
): Promise<AIResponse> {
  const config = options?.config || getEnvConfig();
  const model = options?.model || config.model;
  const maxRetries = config.maxRetries ?? 3;

  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

      const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.max_tokens ?? 2048,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`AI API ${res.status}: ${errBody.slice(0, 500)}`);
      }

      const data = await res.json();
      return data as AIResponse;
    } catch (err: any) {
      lastError = err;
      if (err.name === "AbortError") {
        console.warn(`[AI] timeout, attempt ${attempt + 1}/${maxRetries}`);
      } else {
        console.warn(`[AI] error (attempt ${attempt + 1}/${maxRetries}):`, err.message);
      }
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw new Error(`AI request failed after ${maxRetries} attempts: ${lastError?.message || "unknown error"}`);
}

// Structured JSON mode helper — instructs model to return JSON, parses it
export async function chatJSON<T = any>(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    config?: AIConfig;
  }
): Promise<T> {
  const systemIdx = messages.findIndex((m) => m.role === "system");
  const jsonInstruction =
    "\n\nYou MUST respond with valid JSON only. No markdown, no explanatory text outside the JSON object.";

  if (systemIdx >= 0) {
    messages[systemIdx].content += jsonInstruction;
  } else {
    messages.unshift({ role: "system", content: jsonInstruction });
  }

  const res = await chatCompletion(messages, { ...options, temperature: 0.1 });
  const text = res.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(text.trim()) as T;
  } catch (e: any) {
    console.error("[AI] JSON parse failed. Raw response:", text);
    throw new Error(`AI JSON parse error: ${e.message}`);
  }
}

// Health check — lightweight probe
export async function checkAIHealth(config?: AIConfig): Promise<{ ok: boolean; latency: number; model?: string }> {
  const c = config || getEnvConfig();
  const start = Date.now();
  try {
    const res = await fetch(`${c.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${c.apiKey}` },
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;
    if (!res.ok) return { ok: false, latency };
    const data = await res.json();
    const model = data.data?.[0]?.id;
    return { ok: true, latency, model };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}
