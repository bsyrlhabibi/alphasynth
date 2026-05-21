"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Opportunity} from "@/lib/types";

interface FeedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  search: string;
  action: string;
  riskLevel: string;
  chain: string;
  category: string;
}

export function FeedFilters({ onFilterChange }: FeedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    action: "",
    riskLevel: "",
    chain: "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const update = (key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-6 mb-8">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search signals, protocols, or addresses..."
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
            />
            {filters.search && (
              <button
                onClick={() => update("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-violet-600/20 text-violet-400" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-3">
                <FilterChip
                  label="All"
                  active={filters.action === ""}
                  onClick={() => update("action", "")}
                />
                <FilterChip
                  label="⚠️ Act Now"
                  active={filters.action === "Act"}
                  onClick={() => update("action", "Act")}
                />
                <FilterChip
                  label="👀 Monitor"
                  active={filters.action === "Monitor"}
                  onClick={() => update("action", "Monitor")}
                />
                <FilterChip
                  label="🔬 Research"
                  active={filters.action === "Research"}
                  onClick={() => update("action", "Research")}
                />
                <FilterChip
                  label="📴 Ignore"
                  active={filters.action === "Ignore"}
                  onClick={() => update("action", "Ignore")}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <FilterChip
                  label="All Risk"
                  active={filters.riskLevel === ""}
                  onClick={() => update("riskLevel", "")}
                />
                <FilterChip
                  label="🟢 Low"
                  active={filters.riskLevel === "Low"}
                  onClick={() => update("riskLevel", "Low")}
                />
                <FilterChip
                  label="🟡 Medium"
                  active={filters.riskLevel === "Medium"}
                  onClick={() => update("riskLevel", "Medium")}
                />
                <FilterChip
                  label="🔴 High"
                  active={filters.riskLevel === "High"}
                  onClick={() => update("riskLevel", "High")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-violet-600 text-white"
          : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
