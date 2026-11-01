import { error } from "@sveltejs/kit";
import { catalog } from "#lib/server/catalog.ts";

export const load = ({ params }) => {
  const atlas = catalog();
  const island = atlas.island(params.slug);
  if (!island) error(404, "No island with that name");
  return { island, position: atlas.islands.indexOf(island), brokers: atlas.brokersOn(island.slug).map(({ id, name, iconFile }) => ({ id, name, iconFile })) };
};
