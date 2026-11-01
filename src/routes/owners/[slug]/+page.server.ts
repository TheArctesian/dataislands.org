import { error } from "@sveltejs/kit";
import { catalog } from "#lib/server/catalog.ts";

export const entries = () => catalog().ownerGroups.map(({ slug }) => ({ slug }));

export const load = ({ params }) => {
  const atlas = catalog();
  const groups = atlas.ownerGroups;
  const island = groups.find((group) => group.slug === params.slug);
  if (!island) error(404, "No ownership group with that name");
  return { island, position: groups.indexOf(island), brokers: atlas.brokersOwnedBy(island.slug).map(({ id, name, iconFile }) => ({ id, name, iconFile })) };
};
