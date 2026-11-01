import { error } from "@sveltejs/kit";
import { catalog } from "#lib/server/catalog.ts";

export const load = ({ params }) => {
  const atlas = catalog();
  const broker = atlas.broker(params.id);
  if (!broker) error(404, "No broker with that name");
  const facts = [broker.domains, broker.privacyUrls, broker.optOutUrls, broker.registrations, broker.sensitiveData, broker.collects].flat();
  const sourceNames = Object.fromEntries(atlas.citedSources(facts.flatMap((fact) => fact.sources)).map((source) => [source.id, source.publisher ?? source.url]));
  return { broker, island: atlas.island(broker.islandSlug)!, sourceNames };
};
