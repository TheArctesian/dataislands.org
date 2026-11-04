import type { IslandSummary, PublicBroker } from "#lib/atlas/PublicAtlas.ts";
import type { CitedSource } from "#lib/atlas/brokerFacts.ts";

declare global {
  namespace App {
    interface PageState {
      selected?: { broker: PublicBroker; island: IslandSummary; sources: Record<string, CitedSource> };
    }
  }
}

export {};
