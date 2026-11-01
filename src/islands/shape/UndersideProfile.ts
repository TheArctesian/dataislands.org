import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { PeriodicNoise } from "../core/PeriodicNoise.ts";
import type { Vector3 } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import { polygonContains, type PlanPoint } from "./ClosedOutline.ts";
import type { IslandIdentity } from "./OutlineFactory.ts";
import type { TerraceStack } from "./TerraceStack.ts";

export interface UndersideRing {
  readonly y: number;
  /** Stride over the shared columns: 2 means every second column. */
  readonly stride: number;
  readonly centerX: number;
  readonly centerZ: number;
  /** Radius per kept column, relative to centerX and centerZ. */
  readonly radii: readonly number[];
  readonly taper: number;
  /** Fraction of the total depth this ring sits at. */
  readonly depthFraction: number;
}

export interface HangingTip {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly radius: number;
  readonly length: number;
}

const MIN_COLUMNS = 6;
const TIP_FIT_STEPS = 6;

export const HANGING_TIP_SIDES = 5;

/** One corner of a tip's cross-section at a given radius and height. */
export function hangingTipPoint(tip: HangingTip, radius: number, y: number, side: number): Vector3 {
  const angle = (side / HANGING_TIP_SIDES) * M.TAU;
  return { x: tip.x + radius * M.cos(angle), y, z: tip.z + radius * M.sin(angle) };
}

/** A tapering keel below the base. It ends in hanging points, never a flat fan. */
export class UndersideProfile {
  readonly depth: number;
  readonly rings: readonly UndersideRing[];
  readonly apex: Vector3;
  readonly tips: readonly HangingTip[];

  constructor(stack: TerraceStack, identity: IslandIdentity, rng: SeededRandom) {
    const base = stack.tier(0);
    const table = base.foot.table;
    this.depth = stack.radius * M.clamp(identity.archetype.depthFraction + rng.range(-0.05, 0.05), 0.7, 1.1);
    const ringCount = rng.int(4, 6);
    const keel = new PeriodicNoise(rng, 7);
    const belly = rng.range(0.32, 0.5);

    const rings: UndersideRing[] = [];
    let stride = 1;
    let centerX = 0;
    let centerZ = 0;
    const previousRadius: number[] = [];
    for (let i = 0; i < table.count; i++) previousRadius.push(base.foot.radius(i));
    for (let r = 0; r < ringCount; r++) {
      if (r % 2 === 0 && table.count / (stride * 2) >= MIN_COLUMNS) stride *= 2;
      const remaining = 1 - (r + 1) / (ringCount + 1);
      const taper = remaining * (belly + (1 - belly) * remaining);
      centerX += rng.range(-0.02, 0.02) * stack.radius;
      centerZ += rng.range(-0.02, 0.02) * stack.radius;
      const radii: number[] = [];
      for (let i = 0; i < table.count; i += stride) {
        const wobble = 1 + keel.sample(table.angle(i) / M.TAU + r * 0.13) * 0.12 + rng.range(-0.03, 0.03);
        const radius = Math.min(base.foot.radius(i) * taper * wobble, previousRadius[i]! * 0.93);
        radii.push(radius);
        previousRadius[i] = radius;
      }
      rings.push({
        y: base.footY - this.depth * ((r + 1) / (ringCount + 1)),
        stride,
        centerX,
        centerZ,
        radii,
        taper,
        depthFraction: (r + 1) / (ringCount + 1),
      });
    }
    this.rings = rings;
    this.apex = {
      x: centerX + rng.range(-0.03, 0.03) * stack.radius,
      y: base.footY - this.depth,
      z: centerZ + rng.range(-0.03, 0.03) * stack.radius,
    };

    const extraTips = rng.int(0, 2);
    const tips: HangingTip[] = [];
    const anchor = rings[Math.max(0, ringCount - 3)]!;
    const anchorRing = anchor.radii.map((radius, k) => ({
      x: anchor.centerX + radius * table.cos(k * anchor.stride),
      z: anchor.centerZ + radius * table.sin(k * anchor.stride),
    }));
    for (let t = 0; t < extraTips; t++) {
      const column = rng.int(0, anchor.radii.length - 1);
      const angle = column * anchor.stride;
      const wanted = stack.radius * rng.range(0.07, 0.12);
      const length = this.depth * (rng.range(0.92, 1.08) - anchor.depthFraction);
      const tip = UndersideProfile.fitTip(anchor, anchorRing, table.cos(angle), table.sin(angle), anchor.radii[column]!, wanted, length);
      if (tip) tips.push(tip);
    }
    this.tips = tips;
  }

  /** Shrinks a tip until its top lies inside the ring it hangs from, or gives up. */
  private static fitTip(anchor: UndersideRing, ring: readonly PlanPoint[], cos: number, sin: number, ringRadius: number, wanted: number, length: number): HangingTip | null {
    let radius = wanted;
    for (let step = 0; step < TIP_FIT_STEPS; step++) {
      const reach = Math.max(0, ringRadius * 0.8 - radius);
      const tip = { x: anchor.centerX + reach * cos, y: anchor.y, z: anchor.centerZ + reach * sin, radius, length };
      let inside = true;
      for (let i = 0; i < HANGING_TIP_SIDES; i++) if (!polygonContains(ring, hangingTipPoint(tip, radius, tip.y, i))) inside = false;
      if (inside) return tip;
      radius *= 0.8;
    }
    return null;
  }
}
