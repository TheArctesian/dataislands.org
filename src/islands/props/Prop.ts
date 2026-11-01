import { IsoProjection } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { PropKind, ThemeRamps } from "../input/IslandTheme.ts";
import type { FacetMeshBuilder } from "../mesh/FacetMeshBuilder.ts";
import { PropShapes } from "./PropShapes.ts";

export interface PropPlacement {
  readonly kind: PropKind;
  readonly tier: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly footprint: number;
  readonly height: number;
  /** Uniform scale about the prop's base, applied to `height`. `footprint` already includes it. */
  readonly scale: number;
  readonly yaw: number;
  /** Rung of the ground under the prop, before darkening for a shadow. */
  readonly groundRung: number;
  readonly hasShadow: boolean;
}

export const SHADOW_SIDES = 7;
export const SHADOW_COST = SHADOW_SIDES - 2;

/** A piece of scenery. Heights are absolute, so small islands stay chunky. */
export abstract class Prop {
  abstract readonly kind: PropKind;
  /** Plan radius it needs clear. */
  abstract readonly footprint: number;
  abstract readonly minHeight: number;
  abstract readonly maxHeight: number;
  /** The most triangles one instance may offer, shadow included. */
  abstract readonly triangleCost: number;
  readonly castsShadow: boolean = false;
  readonly isStructure: boolean = false;
  protected readonly ramps: ThemeRamps;

  constructor(ramps: ThemeRamps) {
    this.ramps = ramps;
  }

  /** Lets a prop refuse angles that read badly from the fixed camera. */
  orient(yaw: number): number {
    return yaw;
  }

  abstract emit(builder: FacetMeshBuilder, placement: PropPlacement, rng: SeededRandom): void;

  emitShadow(builder: FacetMeshBuilder, placement: PropPlacement): void {
    if (!placement.hasShadow) return;
    const center = Prop.shadowCenter(placement.x, placement.z, placement.height);
    const rgb = this.ramps.grass.at(placement.groundRung + 1);
    PropShapes.groundPolygon(builder, center.x, placement.y + 0.15, center.z, this.footprint * 1.1, SHADOW_SIDES, placement.yaw, rgb);
  }

  /** The shadow falls away from the sun. */
  static shadowCenter(x: number, z: number, height: number): { x: number; z: number } {
    const sun = IsoProjection.SUN;
    return { x: x - Math.sign(sun.x) * height * 0.1, z: z - Math.sign(sun.z) * height * 0.12 };
  }
}
