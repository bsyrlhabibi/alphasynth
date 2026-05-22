"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface SearchAIResponse {
  query: string;
  mode: string;
  routing?: {
    intent: string;
    agentsUsed: string[];
    confidence: number;
    routingLatencyMs: number;
  };
  answer?: {
    text: string;
    confidence: number;
  };
  signals?: any[];
  agentResults?: Record<string, any>;
  latencyMs?: number;
  error?: string;
}

export function AISearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchAIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      setResult(data);

      if (data.error && !data.answer) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const exampleQueries = [
    "airdrop apa yang lagi hype?",
    "whale movement kek mana hari ini?",
    "yield ETH tertinggi sekarang",
    "ada risk di bridge terbaru?",
  ];

  return (
    <div className="w-full space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Sparkles className="absolute left-4 w-5 h-5 text-violet-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tanya apa aja tentang crypto... (contoh: airdrop apa yang lagi hype?)"
            className="w-full pl-12 pr-24 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analysing...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>AI Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Queries */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="px-3 py-1.5 text-sm bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all border border-slate-700/30"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* AI Answer Card */}
          {result.answer && (
            <div className="p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-slate-400">AI Response</span>
                {result.routing && (
                  <span className="text-xs text-slate-500 ml-auto">
                    {result.routing.intent} • {result.latencyMs}ms
                  </span>
                )}
              </div>
              <div className="text-white text-base leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                {result.answer.text}
              </div>
              {result.answer.confidence > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                      style={{ width: `${result.answer.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{result.answer.confidence}%</span>
                </div>
              )}
            </div>
          )}

          {/* Agents Used */}
          {result.routing?.agentsUsed && result.routing.agentsUsed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.routing.agentsUsed.map((agent) => (
                <span
                  key={agent}
                  className="px-2 py-1 text-xs bg-slate-800/50 text-slate-400 rounded border border-slate-700/30"
                >
                  {agent}
                </span>
              ))}
            </div>
          )}

          {/* Clear Button */}
          <button
            onClick={() => {
              setResult(null);
              setQuery("");
            }}
            className="text-sm text-slate-500 hover:text-white transition-colors"
          >
            ← Clear & try another search
          </button>
        </div>
      )}
    </div>
  );
}
