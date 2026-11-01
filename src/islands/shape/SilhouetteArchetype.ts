import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";

const BACK = M.PI / 4;
const BACK_SPREAD = 1.9;

export type PlanPhases = readonly [number, number, number, number];
type Range = readonly [number, number];

/** One raised part of a plan. Angles and widths are in radians. */
export interface PlanLobe {
  readonly angle: number;
  readonly width: number;
  readonly height: number;
}

interface ArchetypeSettings {
  readonly name: string;
  readonly harmonic2: number;
  readonly harmonic3: number;
  readonly harmonic5: number;
  readonly notch: number;
  readonly notchWidth: number;
  /** "free" spreads lobes round the plan, "axis" sits two on the long axis, "horns" flanks the notch. */
  readonly lobeLayout: "free" | "axis" | "horns";
  readonly lobeCount: Range;
  readonly lobeWidth: Range;
  /** The thinnest the plan's body may get, which keeps two-lobed plans chunky rather than spindly. */
  readonly bodyMin: number;
  /** Convexity the plan is fitted to. Lower means deeper bays between lobes. */
  readonly solidity: Range;
  /** Radius of the summit as a fraction of the island radius. */
  readonly topFraction: number;
  /** How far the summit sits from the plan's origin, as a fraction of its own radius. */
  readonly summitOffset: Range;
  /** How much the summit copies the base plan: 0 is round, 1 is the plan in miniature. */
  readonly summitFollow: number;
  /** Tiers added to or removed from what the size asks for. */
  readonly tierDelta: Range;
  readonly riseScale: number;
  readonly depthFraction: number;
}

/** A family of island plans. The constants are tuned by eye from preview screenshots. */
export class SilhouetteArchetype {
  static readonly ALL: readonly SilhouetteArchetype[] = [
    new SilhouetteArchetype({ name: "Mesa", bodyMin: 0.52, harmonic2: 0.06, harmonic3: 0.12, harmonic5: 0.04, notch: 0.08, notchWidth: 0.6, lobeLayout: "free", lobeCount: [3, 4], lobeWidth: [0.8, 1.2], solidity: [0.83, 0.9], topFraction: 0.62, summitOffset: [0.1, 0.3], summitFollow: 0.5, tierDelta: [-1, 0], riseScale: 1.35, depthFraction: 0.75 }),
    new SilhouetteArchetype({ name: "Crescent", bodyMin: 0.34, harmonic2: 0.06, harmonic3: 0.04, harmonic5: 0.04, notch: 0.9, notchWidth: 1, lobeLayout: "horns", lobeCount: [3, 3], lobeWidth: [0.5, 0.8], solidity: [0.65, 0.73], topFraction: 0.34, summitOffset: [0.5, 0.75], summitFollow: 0.1, tierDelta: [0, 1], riseScale: 1, depthFraction: 0.85 }),
    new SilhouetteArchetype({ name: "Twin Shoulder", bodyMin: 0.46, harmonic2: 0.3, harmonic3: 0.04, harmonic5: 0.04, notch: 0, notchWidth: 0.5, lobeLayout: "axis", lobeCount: [2, 3], lobeWidth: [0.45, 0.7], solidity: [0.68, 0.78], topFraction: 0.42, summitOffset: [0, 0.2], summitFollow: 0.9, tierDelta: [0, 0], riseScale: 1, depthFraction: 0.9 }),
    new SilhouetteArchetype({ name: "Spire", bodyMin: 0.32, harmonic2: 0.06, harmonic3: 0.1, harmonic5: 0.12, notch: 0.1, notchWidth: 0.5, lobeLayout: "free", lobeCount: [4, 6], lobeWidth: [0.3, 0.5], solidity: [0.68, 0.8], topFraction: 0.2, summitOffset: [0.2, 0.6], summitFollow: 0, tierDelta: [1, 2], riseScale: 1.6, depthFraction: 1.1 }),
    new SilhouetteArchetype({ name: "Long Shelf", bodyMin: 0.42, harmonic2: 0.3, harmonic3: 0.05, harmonic5: 0.03, notch: 0, notchWidth: 0.5, lobeLayout: "axis", lobeCount: [2, 2], lobeWidth: [0.7, 1], solidity: [0.78, 0.86], topFraction: 0.32, summitOffset: [0.75, 0.95], summitFollow: 0.2, tierDelta: [-1, 0], riseScale: 0.8, depthFraction: 0.7 }),
  ];

  readonly name: string;
  readonly topFraction: number;
  readonly riseScale: number;
  readonly depthFraction: number;
  readonly summitFollow: number;
  readonly bodyMin: number;
  private readonly settings: ArchetypeSettings;

  private constructor(settings: ArchetypeSettings) {
    this.settings = settings;
    this.name = settings.name;
    this.topFraction = settings.topFraction;
    this.riseScale = settings.riseScale;
    this.depthFraction = settings.depthFraction;
    this.summitFollow = settings.summitFollow;
    this.bodyMin = settings.bodyMin;
  }

  static pick(rng: SeededRandom): SilhouetteArchetype {
    return SilhouetteArchetype.ALL[rng.int(0, SilhouetteArchetype.ALL.length - 1)]!;
  }

  targetSolidity(rng: SeededRandom): number {
    return rng.range(this.settings.solidity[0], this.settings.solidity[1]);
  }

  summitOffset(rng: SeededRandom): number {
    return rng.range(this.settings.summitOffset[0], this.settings.summitOffset[1]);
  }

  tierDelta(rng: SeededRandom): number {
    return rng.int(this.settings.tierDelta[0], this.settings.tierDelta[1]);
  }

  /** Where the summit leans. Mostly away from the camera, so the ledges in front stay in view. */
  summitAngle(phases: PlanPhases, rng: SeededRandom): number {
    const { lobeLayout } = this.settings;
    if (lobeLayout === "horns") return phases[3] + M.PI;
    if (lobeLayout === "axis") {
      const axis = phases[0] / 2;
      return M.cos(axis - BACK) >= 0 ? axis : axis + M.PI;
    }
    return BACK + rng.range(-BACK_SPREAD, BACK_SPREAD);
  }

  lobes(phases: PlanPhases, rng: SeededRandom): PlanLobe[] {
    const { lobeLayout, lobeCount, lobeWidth } = this.settings;
    const count = rng.int(lobeCount[0], lobeCount[1]);
    const width = (): number => rng.range(lobeWidth[0], lobeWidth[1]);
    const lobes: PlanLobe[] = [];
    if (lobeLayout === "horns") {
      lobes.push({ angle: phases[3] + rng.range(0.9, 1.3), width: width(), height: 1 });
      lobes.push({ angle: phases[3] - rng.range(0.9, 1.3), width: width(), height: rng.range(0.7, 1) });
      lobes.push({ angle: phases[3] + M.PI + rng.range(-0.4, 0.4), width: width(), height: rng.range(0.5, 0.8) });
    } else if (lobeLayout === "axis") {
      const axis = phases[0] / 2;
      lobes.push({ angle: axis + rng.range(-0.15, 0.15), width: width(), height: 1 });
      lobes.push({ angle: axis + M.PI + rng.range(-0.15, 0.15), width: width(), height: rng.range(0.7, 1) });
      if (count > 2) lobes.push({ angle: axis + M.PI / 2 + rng.range(-0.5, 0.5), width: width(), height: rng.range(0.3, 0.55) });
    } else {
      const start = rng.range(0, M.TAU);
      for (let i = 0; i < count; i++) {
        lobes.push({ angle: start + ((i + rng.range(-0.3, 0.3)) / count) * M.TAU, width: width(), height: rng.range(0.55, 1) });
      }
    }
    return lobes;
  }

  /** Signed departure from a unit circle at an angle, for one seed's phases. */
  deviation(theta: number, phases: PlanPhases): number {
    const { harmonic2, harmonic3, harmonic5, notch, notchWidth } = this.settings;
    const cusp = (M.cos(theta - phases[3]) - M.cos(notchWidth)) / (1 - M.cos(notchWidth));
    return (
      harmonic2 * M.cos(2 * theta - phases[0]) +
      harmonic3 * M.cos(3 * theta - phases[1]) +
      harmonic5 * M.cos(5 * theta - phases[2]) -
      notch * Math.max(0, cusp)
    );
  }
}
