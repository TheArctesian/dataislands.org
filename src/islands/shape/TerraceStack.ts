import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { PeriodicNoise } from "../core/PeriodicNoise.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { IslandScale } from "../input/IslandScale.ts";
import { ClosedOutline } from "./ClosedOutline.ts";
import type { IslandIdentity } from "./OutlineFactory.ts";

const STEP_UNIT = 4;
const MIN_TIERS = 2;
const MAX_TIERS = 4;
const MIN_SUMMIT_RADIUS = 10;
const MEAN_PLAN_RADIUS = 0.72;

export interface Terrace {
  readonly index: number;
  /** Height of this terrace's flat top. */
  readonly y: number;
  /** Height at which this terrace's cliff meets the ledge below. */
  readonly footY: number;
  /** Top edge of the cliff. */
  readonly rim: ClosedOutline;
  /** Bottom edge of the cliff, wider than the rim by the batter. */
  readonly foot: ClosedOutline;
}

/** Tiers stacked by construction: each foot is derived from the rim below and never exceeds it. */
export class TerraceStack {
  readonly radius: number;
  readonly minLedge: number;
  readonly tiers: readonly Terrace[];

  constructor(base: ClosedOutline, identity: IslandIdentity, scale: IslandScale, rng: SeededRandom) {
    const table = base.table;
    const archetype = identity.archetype;
    this.radius = scale.radius;
    this.minLedge = Math.max(5, scale.radius * 0.1);
    const stepsPerRise = M.lerp(2, 4.6, scale.fraction) * archetype.riseScale;
    const baseCliff = STEP_UNIT * Math.max(2, M.round(stepsPerRise * rng.range(0.9, 1.3)));
    const tiers: Terrace[] = [];
    const firstBatter = rng.range(0.04, 0.08);
    tiers.push({
      index: 0,
      y: 0,
      footY: -baseCliff,
      foot: base,
      rim: new ClosedOutline(table, (i) => base.radius(i) * (1 - firstBatter)),
    });

    const tierCount = M.clamp(scale.tiers + archetype.tierDelta(rng) + rng.int(-1, 1), MIN_TIERS, MAX_TIERS);
    const crown = this.crown(identity, scale);
    // Uneven steps towards the summit, so ledge widths do not follow from size.
    const steps: number[] = [];
    for (let t = 1; t < tierCount; t++) steps.push(rng.range(0.8, 1.3));
    const totalStep = steps.reduce((sum, step) => sum + step, 0);
    let climbed = 0;
    let y = 0;
    for (let t = 1; t < tierCount; t++) {
      const below = tiers[t - 1]!;
      const noise = new PeriodicNoise(rng, 5);
      climbed += steps[t - 1]!;
      const progress = climbed / totalStep;
      const ledgeUnit = rng.range(1, 3);
      const foot = new ClosedOutline(table, (i) => {
        const wanted = M.lerp(base.radius(i), crown(table.angle(i)), progress) + noise.sample(table.angle(i) / M.TAU) * scale.radius * 0.03 - ledgeUnit;
        const lower = below.rim.radius(i);
        const raw = Math.min(lower, Math.max(wanted, scale.radius * 0.12));
        return lower - raw < this.minLedge ? lower : raw;
      });
      const batter = rng.range(0.04, 0.08);
      const rise = STEP_UNIT * Math.max(2, M.round(stepsPerRise * rng.range(0.8, 1.25)));
      const footY = y;
      y += rise;
      tiers.push({
        index: t,
        y,
        footY,
        foot,
        rim: new ClosedOutline(table, (i) => foot.radius(i) * (1 - batter)),
      });
    }
    this.tiers = tiers;
  }

  /** The summit plan: a circle pushed off the origin, part way to the island's own outline. */
  private crown(identity: IslandIdentity, scale: IslandScale): (theta: number) => number {
    const archetype = identity.archetype;
    const radius = Math.max(archetype.topFraction * scale.radius, MIN_SUMMIT_RADIUS);
    const offset = identity.summitOffset * radius;
    return (theta) => {
      const away = theta - identity.summitAngle;
      const sin = M.sin(away);
      const circle = offset * M.cos(away) + Math.sqrt(radius * radius - offset * offset * sin * sin);
      return circle * M.lerp(1, identity.radiusAt(theta) / MEAN_PLAN_RADIUS, archetype.summitFollow);
    };
  }

  tier(index: number): Terrace {
    return this.tiers[index]!;
  }
}
