import type { IslandSummary, PublicBroker } from "#lib/atlas/PublicAtlas.ts";

declare global {
  namespace App {
    interface PageState {
      selected?: { broker: PublicBroker; island: IslandSummary; sourceNames: Record<string, string> };
    }
  }
}

export {};
