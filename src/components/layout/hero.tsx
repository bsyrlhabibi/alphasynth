"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";

export function Hero() {
  const [status, setStatus] = useState({
    agents: { online: 0, total: 0 },
    signals: { processed: 0, total: 0 },
    opportunities: { active: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem("alphasynth-stats") || "null"
      );
      if (s) setStatus(s);
    } catch {}
    setLoading(false);
  }, []);

  return (
    <div className="relative">
      <div className="max-w-4xl mx-auto pt-12 pb-16 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            Live — Multi-Agent Engine Running
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-violet-400">AlphaSynth</span>
            <span className="text-slate-200 ml-3">Discovery Engine</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Cross-referencing on-chain events, social signals, GitHub commits,
            and docs changes — ranked by AI confidence, not human noise.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Agents Online"
            value={loading ? "—" : `${status.agents.online}/${status.agents.total}`}
            icon="🤖"
            gradient="from-violet-600 to-fuchsia-600"
          />
          <StatCard
            label="Signals Processed"
            value={loading ? "—" : `~${status.signals.processed}k/h`}
            icon="📡"
            gradient="from-cyan-600 to-blue-600"
          />
          <StatCard
            label="Active Opportunities"
            value={loading ? "—" : `${status.opportunities.active}`}
            icon="🎯"
            gradient="from-emerald-600 to-teal-600"
          />
        </div>

        {/* Agent Workflow */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="text-sm font-medium text-slate-300 mb-4">
            Agent Architecture
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <AgentNode emoji="🔍" name="Scout" color="cyan" delay="0s" />
            <Arrow />
            <AgentNode emoji="🧠" name="Analyst" color="violet" delay="0.15s" />
            <Arrow />
            <AgentNode emoji="🛡️" name="Risk" color="amber" delay="0.3s" />
            <Arrow />
            <AgentNode emoji="⚡" name="Synthesize" color="emerald" delay="0.45s" />
            <Arrow />
            <AgentNode emoji="📊" name="Output" color="rose" delay="0.6s" />
          </div>
          <div className="text-xs text-slate-500 text-center mt-4">
            Scout detects → Analyst reasons → Risk scores → Synthesize
            aggregates → Output delivers
          </div>
        </div>
      </div>

      {/* Gradient grid background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} bg-opacity-10 rounded-xl p-4 border border-slate-800`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function AgentNode({
  emoji,
  name,
  color,
  delay,
}: {
  emoji: string;
  name: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 animate-pulse`}
      style={{ animationDelay: delay, animationDuration: "2s" }}
    >
      <div
        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-${color}-600/20 border border-${color}-500/30 flex items-center justify-center text-xl`}
      >
        {emoji}
      </div>
      <span className="text-[10px] text-slate-400">{name}</span>
    </div>
  );
}

function Arrow() {
  return (
    <span className="text-slate-700 text-lg animate-pulse">→</span>
  );
}
