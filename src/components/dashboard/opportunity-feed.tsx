"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpportunityCard } from "@/components/dashboard/opportunity-card";
import { FeedFilters } from "@/components/layout/feed-filters";
import type { Opportunity } from "@/lib/types";
import { mockOpportunities } from "@/lib/data/mock";

export function OpportunityFeed() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    riskLevel: "",
    chain: "",
    category: "",
  });

  useEffect(() => {
    // Simulate agent processing time — like data is being ingested
    const t = setTimeout(() => {
      setOpportunities(mockOpportunities);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      if (
        filters.search &&
        !opp.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !opp.category.toLowerCase().includes(filters.search.toLowerCase()) &&
        !opp.agentOutputs.some((a) =>
          a.tags.some((t) =>
            t.toLowerCase().includes(filters.search.toLowerCase())
          )
        )
      )
        return false;
      if (filters.action && opp.action !== filters.action) return false;
      if (filters.riskLevel && opp.riskLevel !== filters.riskLevel)
        return false;
      if (filters.chain && opp.chain !== filters.chain) return false;
      if (filters.category && opp.category !== filters.category) return false;
      return true;
    });
  }, [opportunities, filters]);

  return (
    <div className="min-h-screen">
      <FeedFilters onFilterChange={setFilters} />
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-400">
            Live Feed — {filtered.length} active signals
          </h2>
          <span className="text-xs text-slate-600">
            Last synced: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-slate-500 text-sm">No results match your filters</p>
              <p className="text-slate-600 text-xs mt-1">
                Try adjusting search terms or filters
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((opp, i) => (
                <OpportunityCard key={opp.id} opportunity={opp} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
