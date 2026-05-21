"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Opportunity } from "@/lib/types";
import { Brain, Shield, Search, Sparkles, ChevronRight } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
}

const actionColors = {
  Act: "destructive" as const,
  Monitor: "success" as const,
  Research: "warning" as const,
  Ignore: "secondary" as const,
};

const agentIcons: Record<string, React.ReactNode> = {
  Scout: <Search className="h-3 w-3" />,
  Analyst: <Brain className="h-3 w-3" />,
  Risk: <Shield className="h-3 w-3" />,
  Synthesize: <Sparkles className="h-3 w-3" />,
};

const agentColors: Record<string, string> = {
  Scout: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Analyst: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Synthesize: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function OpportunityCard({ opportunity, index }: OpportunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={actionColors[opportunity.action]}>
              {opportunity.action}
            </Badge>
            <Badge
              variant={
                opportunity.riskLevel === "High"
                  ? "destructive"
                  : opportunity.riskLevel === "Medium"
                  ? "warning"
                  : "success"
              }
            >
              {opportunity.riskLevel} Risk
            </Badge>
            <span className="text-xs text-slate-500">{opportunity.chain}</span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {opportunity.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-violet-400">
              {opportunity.finalScore}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">
              Score
            </div>
          </div>
        </div>
      </div>

      {/* Signal count */}
      <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
        <span>{opportunity.signals.length} signals detected</span>
        <span>|</span>
        <span>{opportunity.agentOutputs.length} agents converged</span>
      </div>

      {/* Agent outputs - always visible */}
      <div className="space-y-2 mb-3">
        {opportunity.agentOutputs.map((output) => (
          <div
            key={output.agent}
            className="flex items-start gap-2 text-xs"
          >
            <Badge
              className={`mt-0.5 shrink-0 ${agentColors[output.agent]}`}
            >
              <span className="flex items-center gap-1">
                {agentIcons[output.agent]}
                {output.agent}
              </span>
            </Badge>
            <span className="text-slate-300 leading-relaxed">
              {output.conclusion}
            </span>
          </div>
        ))}
      </div>

      {/* Reasoning chains */}
      <Accordion type="single" collapsible>
        <AccordionItem value="reasoning" className="border-slate-700">
          <AccordionTrigger className="text-xs text-slate-500 hover:text-violet-400 py-2">
            View Reasoning Chains
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {opportunity.agentOutputs.map((output) => (
                <div
                  key={output.agent}
                  className="bg-slate-950 rounded-lg p-3 border border-slate-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${agentColors[output.agent]}`}
                    >
                      {output.agent}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Confidence: {output.confidence}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {output.reasoning.map((step) => (
                      <div key={step.step} className="text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-600 shrink-0 mt-0.5">
                            {step.step}.
                          </span>
                          <div>
                            <span className="text-slate-400">
                              🔍 {step.observation}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 pl-4 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" />
                          <span className="text-violet-400/80">
                            {step.hypothesis}
                          </span>
                        </div>
                        <div className="pl-4 mt-0.5">
                          <span className="text-[10px] text-slate-600">
                            Confidence: {step.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800">
        {opportunity.agentOutputs
          .flatMap((o) => o.tags)
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-500"
            >
              #{tag}
            </span>
          ))}
      </div>
    </motion.div>
  );
}
