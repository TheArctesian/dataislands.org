import { DeterministicMath as M } from "../core/DeterministicMath.ts";

const SEGMENT_STEPS = [24, 28, 32, 36] as const;
const OCTAVES = 10;

export const ISLAND_TRIANGLE_CAP = 6000;
export const PROP_TRIANGLE_CAP = 3000;
export const CLOUD_TRIANGLE_CAP = 1200;

/** Everything that grows with size. Saturates at size 1023. */
export class IslandScale {
  readonly fraction: number;
  readonly radius: number;
  readonly tiers: number;
  readonly segments: number;
  readonly propTarget: number;
  /** Scenery grows with the island, so large islands keep readable props. */
  readonly propScale: number;
  readonly triangleAllowance: number;

  constructor(size: number) {
    this.fraction = IslandScale.fractionOf(size);
    const s = this.fraction;
    this.radius = M.lerp(28, 120, s);
    this.tiers = 2 + Math.floor(s * 2.999);
    this.segments = SEGMENT_STEPS[Math.floor(s * 3.999)]!;
    this.propTarget = M.round(M.lerp(8, 42, s));
    this.propScale = M.lerp(1, 2.1, s);
    this.triangleAllowance = M.round(M.lerp(1800, ISLAND_TRIANGLE_CAP, s));
  }

  /** Piecewise-linear log2 of (size + 1) over 0..1024, mapped to 0..1. */
  static fractionOf(size: number): number {
    const value = size + 1;
    let power = 1;
    let octave = 0;
    while (octave < OCTAVES && power * 2 <= value) {
      power *= 2;
      octave++;
    }
    return M.clamp((octave + (value - power) / power) / OCTAVES, 0, 1);
  }
}
