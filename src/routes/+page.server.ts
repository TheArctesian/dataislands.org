import { catalog } from "#lib/server/catalog.ts";

export const load = () => {
  const atlas = catalog();
  return { islands: atlas.islands, brokerCount: atlas.brokers.length, ownerCount: atlas.brokers.filter((b) => b.owner).length, sortedCount: atlas.brokers.filter((b) => b.islandSlug !== "still-being-sorted").length };
};
