import type { ColorRamp } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { IsoProjection, type Vector3 } from "../core/IsoProjection.ts";
import type { ValueNoise2D } from "../core/PeriodicNoise.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { Terrace, TerraceStack } from "../shape/TerraceStack.ts";
import type { FacetMeshBuilder } from "./FacetMeshBuilder.ts";
import { Ring, RingStitcher, type TriangleSink } from "./RingStitcher.ts";

const RUNGS_PER_TIER = 0.5;

/** Flat tops share one lambert value, so tier height and meadow patches supply the variation. */
export class SurfaceTone {
  private readonly stack: TerraceStack;
  private readonly patches: ValueNoise2D;
  private readonly ramp: ColorRamp;

  constructor(stack: TerraceStack, patches: ValueNoise2D, ramp: ColorRamp) {
    this.stack = stack;
    this.patches = patches;
    this.ramp = ramp;
  }

  /** Rung of bare ground, matching what a flat upward facet is handed before hash jitter. */
  rung(tier: number, x: number, z: number): number {
    return M.round((1 - IsoProjection.SUN.y) * (this.ramp.length - 1) + this.at(tier, x, z));
  }

  /** Rung offset for ground at a tier and position. */
  at(tier: number, x: number, z: number): number {
    const fromTop = this.stack.tiers.length - 1 - tier;
    return fromTop * RUNGS_PER_TIER - 0.6 + (this.patches.sample(x, z) * 2 - 1);
  }
}

export class TerraceSurfaceMesher {
  private readonly stack: TerraceStack;
  private readonly ramp: ColorRamp;
  private readonly tone: SurfaceTone;
  private readonly rng: SeededRandom;

  constructor(stack: TerraceStack, ramp: ColorRamp, tone: SurfaceTone, rng: SeededRandom) {
    this.stack = stack;
    this.ramp = ramp;
    this.tone = tone;
    this.rng = rng;
  }

  emit(builder: FacetMeshBuilder): void {
    const splitWidth = this.stack.minLedge * 2.5;
    for (const tier of this.stack.tiers) {
      const facet = (a: Vector3, b: Vector3, c: Vector3): void => {
        builder.facet(a, b, c, this.ramp, this.tone.at(tier.index, (a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3));
      };
      const outer = (i: number): Vector3 => ({ x: tier.rim.x(i), y: tier.y, z: tier.rim.z(i) });
      const count = tier.rim.table.count;
      const above = this.stack.tiers[tier.index + 1];
      if (!above) {
        this.emitSummit(tier, facet);
        continue;
      }
      const inner = (i: number): Vector3 => ({ x: above.foot.x(i), y: tier.y, z: above.foot.z(i) });
      const wide = (i: number): boolean => tier.rim.radius(i) - above.foot.radius(i) >= splitWidth;
      const mid = (i: number): Vector3 => {
        const a = inner(i);
        const b = outer(i);
        return { x: M.lerp(a.x, b.x, 0.5), y: tier.y, z: M.lerp(a.z, b.z, 0.5) };
      };
      for (let i = 0; i < count; i++) {
        const near = wide(i);
        const far = wide(i + 1);
        if (near && far) {
          facet(inner(i), inner(i + 1), mid(i));
          facet(inner(i + 1), mid(i + 1), mid(i));
          facet(mid(i), mid(i + 1), outer(i));
          facet(mid(i + 1), outer(i + 1), outer(i));
        } else if (near) {
          facet(inner(i), inner(i + 1), mid(i));
          facet(inner(i + 1), outer(i + 1), mid(i));
          facet(mid(i), outer(i + 1), outer(i));
        } else if (far) {
          facet(inner(i), inner(i + 1), mid(i + 1));
          facet(inner(i), mid(i + 1), outer(i));
          facet(mid(i + 1), outer(i + 1), outer(i));
        } else {
          facet(inner(i), inner(i + 1), outer(i));
          facet(inner(i + 1), outer(i + 1), outer(i));
        }
      }
    }
  }

  /** Inset rings at half the columns each, closed by a strip, so no point gathers every facet. */
  private emitSummit(tier: Terrace, facet: TriangleSink): void {
    const count = tier.rim.table.count;
    const table = tier.rim.table;
    const ringAt = (stride: number, radiusAt: (column: number) => number): Ring => {
      const points: Vector3[] = [];
      for (let i = 0; i < count; i += stride) {
        const radius = radiusAt(i);
        points.push({ x: radius * table.cos(i), y: tier.y, z: radius * table.sin(i) });
      }
      return new Ring(points);
    };
    const midRadii: number[] = [];
    for (let i = 0; i < count; i += 2) midRadii.push(tier.rim.radius(i) * this.rng.range(0.58, 0.72));
    const core = Math.min(...midRadii) * 0.55;
    const inner = ringAt(4, () => core * this.rng.range(0.92, 1));
    const mid = ringAt(2, (i) => midRadii[i / 2]!);
    RingStitcher.stitch(mid, ringAt(1, (i) => tier.rim.radius(i)), facet);
    RingStitcher.stitch(inner, mid, facet);
    let low = 0;
    let high = inner.count - 1;
    while (high - low >= 2) {
      facet(inner.at(low), inner.at(high), inner.at(low + 1));
      low++;
      if (high - low < 2) break;
      facet(inner.at(low), inner.at(high), inner.at(high - 1));
      high--;
    }
  }
}
