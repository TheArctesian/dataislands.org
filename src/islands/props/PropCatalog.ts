import type { SeededRandom } from "../core/SeededRandom.ts";
import { PROP_KINDS, type IslandTheme, type PropKind, type ThemeRamps } from "../input/IslandTheme.ts";
import { BoulderProp, FlowerProp, HutProp, ShrubProp, StandingStonesProp, WatchtowerProp } from "./GroundProps.ts";
import type { Prop } from "./Prop.ts";
import { BroadleafProp, ConiferProp, PalmProp } from "./TreeProps.ts";

/** The prop types a theme draws from, with its weights. */
export class PropCatalog {
  private readonly props: ReadonlyMap<PropKind, Prop>;
  private readonly weights: readonly { readonly prop: Prop; readonly weight: number }[];
  private readonly totalWeight: number;

  constructor(theme: IslandTheme, ramps: ThemeRamps) {
    const all: Prop[] = [
      new ConiferProp(ramps),
      new BroadleafProp(ramps),
      new PalmProp(ramps),
      new BoulderProp(ramps),
      new ShrubProp(ramps),
      new FlowerProp(ramps),
      new HutProp(ramps),
      new WatchtowerProp(ramps),
      new StandingStonesProp(ramps),
    ];
    this.props = new Map(all.map((p) => [p.kind, p]));
    this.weights = PROP_KINDS.map((kind) => ({ prop: this.prop(kind), weight: Math.max(0, theme.propMix[kind] ?? 0) })).filter((e) => e.weight > 0);
    this.totalWeight = this.weights.reduce((sum, e) => sum + e.weight, 0);
  }

  prop(kind: PropKind): Prop {
    return this.props.get(kind)!;
  }

  get structures(): readonly Prop[] {
    return this.weights.filter((e) => e.prop.isStructure).map((e) => e.prop);
  }

  /** The theme's prop with the smallest footprint, or null if the mix is empty. */
  get smallest(): Prop | null {
    let best: Prop | null = null;
    for (const { prop } of this.weights) if (!best || prop.footprint < best.footprint) best = prop;
    return best;
  }

  /** A weighted choice from the theme's mix, or null if the mix is empty. */
  pick(rng: SeededRandom): Prop | null {
    let roll = rng.next() * this.totalWeight;
    for (const entry of this.weights) {
      roll -= entry.weight;
      if (roll < 0) return entry.prop;
    }
    return null;
  }
}
