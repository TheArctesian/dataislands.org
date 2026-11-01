import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { PeriodicNoise } from "../core/PeriodicNoise.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import { AngleTable, ClosedOutline, polygonSolidity } from "./ClosedOutline.ts";
import { SilhouetteArchetype, type PlanLobe, type PlanPhases } from "./SilhouetteArchetype.ts";

/** A plan's radius stays within 1 - INDENT and 1. */
export const INDENT = 0.7;
const BODY_MAX = 0.62;
/** How strongly an archetype's harmonics and notch bend the plan, as a fraction of its radius. */
const DEVIATION_SCALE = 0.35;
const FIT_SAMPLES = 96;
const FIT_STEPS = 10;

/** The unit-radius plan of one seed: lobes reaching out from a body. It never reads size, so an island stays recognisable as it grows. */
export class IslandIdentity {
  readonly archetype: SilhouetteArchetype;
  /** Direction the summit leans, in radians. */
  readonly summitAngle: number;
  /** How far the summit leans, as a fraction of its own radius. */
  readonly summitOffset: number;
  private readonly keyAngles: readonly number[];
  private readonly keyLobes: readonly number[];
  private readonly keyBends: readonly number[];
  private keyRadii: number[] = [];

  constructor(rng: SeededRandom) {
    this.archetype = SilhouetteArchetype.pick(rng);
    const phases: PlanPhases = [rng.range(0, M.TAU), rng.range(0, M.TAU), rng.range(0, M.TAU), rng.range(0, M.TAU)];
    const lobes = this.archetype.lobes(phases, rng);
    this.summitAngle = this.archetype.summitAngle(phases, rng);
    this.summitOffset = this.archetype.summitOffset(rng);
    const keyCount = rng.int(8, 14);
    const warp = new PeriodicNoise(rng, 6);
    // Key angles stay inside 0..TAU, which is the range deviationAt looks them up in.
    const angles: number[] = [];
    for (let i = 0; i < keyCount; i++) angles.push(((i + 0.5 + rng.range(-0.3, 0.3)) / keyCount) * M.TAU);
    const pinned = new Set<number>();
    for (const lobe of lobes) IslandIdentity.pinNearestKey(angles, lobe.angle, pinned);
    angles.sort((a, b) => a - b);
    this.keyAngles = angles;
    this.keyLobes = angles.map((angle) => IslandIdentity.lobeHeight(lobes, angle));
    this.keyBends = angles.map((angle, i) => this.archetype.deviation(angle, phases) * DEVIATION_SCALE + warp.sample(i / keyCount) * 0.04 + rng.range(-0.02, 0.02));
    this.fitSolidity(this.archetype.targetSolidity(rng));
  }

  /** Moves the closest free key onto an angle, so sparse keys cannot step over a lobe. */
  private static pinNearestKey(angles: number[], angle: number, pinned: Set<number>): void {
    const wrapped = angle - M.TAU * Math.floor(angle / M.TAU);
    let nearest = -1;
    let best = Infinity;
    angles.forEach((key, i) => {
      const turns = (key - wrapped) / M.TAU;
      const away = Math.abs(turns - M.round(turns));
      if (away < best && !pinned.has(i)) {
        best = away;
        nearest = i;
      }
    });
    if (nearest < 0) return;
    angles[nearest] = wrapped;
    pinned.add(nearest);
  }

  private static lobeHeight(lobes: readonly PlanLobe[], angle: number): number {
    let best = 0;
    for (const lobe of lobes) {
      const turns = (angle - lobe.angle) / M.TAU;
      const x = (Math.abs(turns - M.round(turns)) * M.TAU) / lobe.width;
      if (x < 1) best = Math.max(best, lobe.height * (1 - x * x));
    }
    return best;
  }

  /** Radius in 1 - INDENT..1 at an angle, joining the sparse keys linearly into chunky straight runs. */
  radiusAt(theta: number): number {
    const count = this.keyAngles.length;
    const wrapped = theta - M.TAU * Math.floor(theta / M.TAU);
    let upper = 0;
    while (upper < count && this.keyAngles[upper]! <= wrapped) upper++;
    const before = this.keyAngles[(upper + count - 1) % count]! - (upper === 0 ? M.TAU : 0);
    const after = this.keyAngles[upper % count]! + (upper === count ? M.TAU : 0);
    const t = (wrapped - before) / (after - before);
    return M.lerp(this.keyRadii[(upper + count - 1) % count]!, this.keyRadii[upper % count]!, t);
  }

  /** A thinner body leaves the lobes standing further out, which lowers solidity. */
  private fitSolidity(target: number): void {
    let low = this.archetype.bodyMin;
    let high = BODY_MAX;
    for (let step = 0; step < FIT_STEPS; step++) {
      const body = (low + high) / 2;
      this.setBody(body);
      if (this.solidity() > target) high = body;
      else low = body;
    }
  }

  private setBody(body: number): void {
    this.keyRadii = this.keyLobes.map((lobe, i) => M.clamp(M.lerp(body, 1, lobe) + this.keyBends[i]!, 1 - INDENT, 1));
  }

  private solidity(): number {
    const points = [];
    for (let i = 0; i < FIT_SAMPLES; i++) {
      const theta = (i / FIT_SAMPLES) * M.TAU;
      const radius = this.radiusAt(theta);
      points.push({ x: radius * M.cos(theta), z: radius * M.sin(theta) });
    }
    return polygonSolidity(points);
  }
}

export class OutlineFactory {
  /** Base outline at a world radius, sampled on the island's shared columns. */
  static base(identity: IslandIdentity, table: AngleTable, radius: number): ClosedOutline {
    return new ClosedOutline(table, (i) => radius * identity.radiusAt(table.angle(i)));
  }
}
