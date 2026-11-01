import type { ColorRamp } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { Vector3 } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { ThemeRamps } from "../input/IslandTheme.ts";
import type { Terrace, TerraceStack } from "../shape/TerraceStack.ts";
import type { FacetMeshBuilder } from "./FacetMeshBuilder.ts";
import { Ring, RingStitcher } from "./RingStitcher.ts";

const TALL_RISE = 12;

/** Rim, zigzag grass lip, then soil and rock at half the columns, ending exactly on the foot ring. */
export class CliffMesher {
  private readonly stack: TerraceStack;
  private readonly ramps: ThemeRamps;
  private readonly rng: SeededRandom;

  constructor(stack: TerraceStack, ramps: ThemeRamps, rng: SeededRandom) {
    this.stack = stack;
    this.ramps = ramps;
    this.rng = rng;
  }

  emit(builder: FacetMeshBuilder): void {
    for (const tier of this.stack.tiers) this.emitTier(builder, tier);
  }

  private emitTier(builder: FacetMeshBuilder, tier: Terrace): void {
    const count = tier.rim.table.count;
    const rise = tier.y - tier.footY;
    const rim = CliffMesher.outlineRing(tier, "rim");
    const foot = CliffMesher.outlineRing(tier, "foot");
    const lip = new Ring(this.band(tier, count, 1, (i) => (i % 2 === 0 ? 1.1 : 2.8)));
    const soil = new Ring(this.band(tier, count, 2, () => rise * 0.45));
    // Rung jitter on rock turns large cliffs into a patchwork, so light alone separates its facets.
    const band = (first: Ring, second: Ring, ramp: ColorRamp, offset = 0, jitter = true): void => {
      RingStitcher.stitch(first, second, (a, b, c) => builder.facet(a, b, c, ramp, offset, jitter));
    };
    band(rim, lip, this.ramps.grass, 0.4);
    band(lip, soil, this.ramps.soil);
    if (rise >= TALL_RISE) {
      const rock = new Ring(this.band(tier, count, 2, () => rise * 0.74));
      band(soil, rock, this.ramps.stone, 0, false);
      band(rock, foot, this.ramps.stone, 0.6, false);
    } else {
      band(soil, foot, this.ramps.stone, 0, false);
    }
  }

  /** One jittered ring between rim and foot. Jitter shrinks on short cliffs so rows cannot cross. */
  private band(tier: Terrace, count: number, stride: number, dropAt: (column: number) => number): Vector3[] {
    const rise = tier.y - tier.footY;
    const strength = Math.min(1, rise / 16);
    const points: Vector3[] = [];
    for (let i = 0; i < count; i += stride) {
      const drop = M.clamp(dropAt(i) + this.rng.range(-2, 2) * strength * strength, 0.5, rise - 0.5);
      const p = drop / rise;
      const radius = M.lerp(tier.rim.radius(i), tier.foot.radius(i), p) - this.rng.range(0, 1.8) * strength;
      points.push({ x: radius * tier.rim.table.cos(i), y: tier.y - drop, z: radius * tier.rim.table.sin(i) });
    }
    return points;
  }

  static outlineRing(tier: Terrace, which: "rim" | "foot"): Ring {
    const outline = which === "rim" ? tier.rim : tier.foot;
    const y = which === "rim" ? tier.y : tier.footY;
    const points: Vector3[] = [];
    for (let i = 0; i < outline.table.count; i++) points.push({ x: outline.x(i), y, z: outline.z(i) });
    return new Ring(points);
  }
}
