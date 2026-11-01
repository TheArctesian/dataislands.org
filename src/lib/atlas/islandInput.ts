import { PLACEHOLDER_THEMES as themes } from "../../islands/preview/placeholderThemes.ts";
import type { IslandInput } from "../../islands/input/IslandSpec.ts";

const seedOf = (slug: string) => [...slug].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);

/** The same island on the map and on its own page. */
export function islandInput(slug: string, brokerCount: number, position: number): IslandInput {
  return { seed: seedOf(slug), size: brokerCount, theme: themes[position % themes.length]! };
}
