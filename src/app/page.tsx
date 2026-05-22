import { Hero } from "@/components/layout/hero";
import { OpportunityFeed } from "@/components/dashboard/opportunity-feed";
import { AISearchBar } from "@/components/search/ai-search-bar";

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* AI Search Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            🔍 AI-Powered Search
          </h2>
          <p className="text-slate-400 text-sm">
            Ask anything about crypto — airdrops, whale movements, yields, risks. 
            Our AI agents analyze live data to give you actionable insights.
          </p>
        </div>
        <AISearchBar />
      </section>

      <OpportunityFeed />
    </main>
  );
}
