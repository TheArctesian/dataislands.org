import { catalog } from "#lib/server/catalog.ts";

export const load = () => {
  const atlas = catalog();
  const groups = atlas.ownerGroups;
  return { groups, groupedBrokers: groups.reduce((sum, group) => sum + group.brokerCount, 0), verifiedBrokers: atlas.brokers.filter((b) => b.owner).length, brokerCount: atlas.brokers.length };
};
