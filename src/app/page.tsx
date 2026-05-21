import { Hero } from "@/components/layout/hero";
import { OpportunityFeed } from "@/components/dashboard/opportunity-feed";

export default function Home() {
  return (
    <main>
      <Hero />
      <OpportunityFeed />
    </main>
  );
}
