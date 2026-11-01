import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { FacetMeshBuilder } from "../mesh/FacetMeshBuilder.ts";
import { Prop, SHADOW_COST, type PropPlacement } from "./Prop.ts";
import { PropShapes } from "./PropShapes.ts";

const SCREEN_HORIZONTAL = (3 * M.PI) / 4;
const RIDGE_CLEARANCE = M.PI / 6;

export class BoulderProp extends Prop {
  readonly kind = "boulder" as const;
  readonly footprint = 3.5;
  readonly minHeight = 8;
  readonly maxHeight = 11;
  readonly triangleCost = 5 * 4;

  emit(builder: FacetMeshBuilder, p: PropPlacement, rng: SeededRandom): void {
    const r = p.height * 0.38;
    PropShapes.blob(builder, { x: p.x, y: p.y + r * 0.45, z: p.z }, r, r * 0.8, r * rng.range(0.8, 1.05), 5, p.yaw, this.ramps.boulder, rng);
  }
}

export class ShrubProp extends Prop {
  readonly kind = "shrub" as const;
  readonly footprint = 2.5;
  readonly minHeight = 8;
  readonly maxHeight = 10;
  readonly triangleCost = 4 * 4;

  emit(builder: FacetMeshBuilder, p: PropPlacement, rng: SeededRandom): void {
    const r = p.height * 0.3;
    PropShapes.blob(builder, { x: p.x, y: p.y + r * 0.7, z: p.z }, r, r * 0.85, r, 4, p.yaw, this.ramps.leaf, rng, 0.5);
  }
}

export class FlowerProp extends Prop {
  readonly kind = "flower" as const;
  readonly footprint = 2.5;
  readonly minHeight = 8;
  readonly maxHeight = 9;
  readonly triangleCost = 5 * 3;

  emit(builder: FacetMeshBuilder, p: PropPlacement, rng: SeededRandom): void {
    for (let k = 0; k < 5; k++) {
      const angle = p.yaw + (k / 5) * M.TAU;
      const reach = k === 0 ? 0 : rng.range(0.8, 2);
      const x = p.x + reach * M.cos(angle);
      const z = p.z + reach * M.sin(angle);
      const base = { x, y: p.y, z };
      const rung = k % 2 === 0 ? -1 : 1;
      PropShapes.frustum(builder, base, 0.75, 0, rng.range(1.2, 2.2), 3, angle, this.ramps.accent, rung);
    }
  }
}

export class StandingStonesProp extends Prop {
  readonly kind = "stones" as const;
  readonly footprint = 5.5;
  readonly minHeight = 9;
  readonly maxHeight = 14;
  readonly triangleCost = 5 * (8 + 2) + SHADOW_COST;
  override readonly castsShadow = true;
  override readonly isStructure = true;

  emit(builder: FacetMeshBuilder, p: PropPlacement, rng: SeededRandom): void {
    this.emitShadow(builder, p);
    for (let k = 0; k < 5; k++) {
      const angle = p.yaw + (k / 5) * M.TAU;
      const base = { x: p.x + 3.6 * M.cos(angle), y: p.y, z: p.z + 3.6 * M.sin(angle) };
      PropShapes.frustum(builder, base, 1.25, 0.8, p.height * rng.range(0.6, 1), 4, angle, this.ramps.boulder, -0.5, true);
    }
  }
}

export class HutProp extends Prop {
  readonly kind = "hut" as const;
  readonly footprint = 6;
  readonly minHeight = 10;
  readonly maxHeight = 13;
  readonly triangleCost = 8 + 2 + 6 + 2 + SHADOW_COST;
  override readonly castsShadow = true;
  override readonly isStructure = true;

  /**
   * With the ridge along the screen, one roof slope fills the view as a flat rectangle.
   * Keeps the ridge at least RIDGE_CLEARANCE off that line; a half turn only moves the door.
   */
  override orient(yaw: number): number {
    const turn = yaw / M.TAU;
    const within = (turn * 2 - Math.floor(turn * 2)) * (M.PI - 2 * RIDGE_CLEARANCE);
    return SCREEN_HORIZONTAL + RIDGE_CLEARANCE + within + (turn - Math.floor(turn) >= 0.5 ? M.PI : 0);
  }

  emit(builder: FacetMeshBuilder, p: PropPlacement, _rng: SeededRandom): void {
    this.emitShadow(builder, p);
    const wallHeight = p.height * 0.5;
    const half = 3.9;
    const radius = half * Math.SQRT2;
    PropShapes.frustum(builder, p, radius, radius, wallHeight, 4, p.yaw + M.PI / 4, this.ramps.wall, 0, true);
    PropShapes.gableRoof(builder, { x: p.x, y: p.y + wallHeight, z: p.z }, half + 0.8, half + 1, p.height * 0.5, p.yaw, this.ramps.roof);
    const cos = M.cos(p.yaw);
    const sin = M.sin(p.yaw);
    // The door sits on whichever long wall faces the camera.
    const side = -cos - sin >= 0 ? half + 0.05 : -half - 0.05;
    const doorAt = (along: number, y: number) => ({ x: p.x + side * cos - along * sin, y: p.y + y, z: p.z + side * sin + along * cos });
    const a = doorAt(-1, 0);
    const b = doorAt(1, 0);
    const c = doorAt(1, wallHeight * 0.72);
    const d = doorAt(-1, wallHeight * 0.72);
    const [first, second] = side > 0 ? [c, a] : [a, c];
    builder.facet(d, first, second, this.ramps.accent, 0, false);
    builder.facet(b, second, first, this.ramps.accent, 0, false);
  }
}

export class WatchtowerProp extends Prop {
  readonly kind = "watchtower" as const;
  readonly footprint = 6;
  readonly minHeight = 18;
  readonly maxHeight = 24;
  readonly triangleCost = 12 + 12 + 4 + 12 + 6 + SHADOW_COST;
  override readonly castsShadow = true;
  override readonly isStructure = true;

  emit(builder: FacetMeshBuilder, p: PropPlacement, _rng: SeededRandom): void {
    this.emitShadow(builder, p);
    const h = p.height;
    PropShapes.frustum(builder, p, 4.4, 3, h * 0.6, 6, p.yaw, this.ramps.wall);
    const deckY = p.y + h * 0.6;
    PropShapes.frustum(builder, { x: p.x, y: deckY, z: p.z }, 3.2, 4.6, 1.4, 6, p.yaw, this.ramps.trunk, 0, true);
    const cabinY = deckY + 1.4;
    PropShapes.frustum(builder, { x: p.x, y: cabinY, z: p.z }, 3, 3, h * 0.14, 6, p.yaw, this.ramps.wall, -0.5);
    PropShapes.frustum(builder, { x: p.x, y: cabinY + h * 0.14, z: p.z }, 4.8, 0, h * 0.26 - 1.4, 6, p.yaw, this.ramps.accent);
  }
}
