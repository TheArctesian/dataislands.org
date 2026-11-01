import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { Vector3 } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { FacetMeshBuilder } from "../mesh/FacetMeshBuilder.ts";
import { Prop, SHADOW_COST, type PropPlacement } from "./Prop.ts";
import { PropShapes } from "./PropShapes.ts";

export class ConiferProp extends Prop {
  readonly kind = "conifer" as const;
  readonly footprint = 3.5;
  readonly minHeight = 14;
  readonly maxHeight = 24;
  readonly triangleCost = 5 * 2 + 3 * 6 + SHADOW_COST;
  override readonly castsShadow = true;

  emit(builder: FacetMeshBuilder, p: PropPlacement, _rng: SeededRandom): void {
    this.emitShadow(builder, p);
    const h = p.height;
    PropShapes.frustum(builder, p, h * 0.05, h * 0.03, h * 0.28, 5, p.yaw, this.ramps.trunk);
    for (let k = 0; k < 3; k++) {
      const base = { x: p.x, y: p.y + h * (0.18 + k * 0.24), z: p.z };
      PropShapes.frustum(builder, base, h * (0.26 - k * 0.055), 0, h * (0.42 - k * 0.04), 6, p.yaw + k * 0.5, this.ramps.conifer, -k * 0.4);
    }
  }
}

export class BroadleafProp extends Prop {
  readonly kind = "broadleaf" as const;
  readonly footprint = 4;
  readonly minHeight = 11;
  readonly maxHeight = 20;
  readonly triangleCost = 5 * 2 + 3 * 5 * 4 + SHADOW_COST;
  override readonly castsShadow = true;

  emit(builder: FacetMeshBuilder, p: PropPlacement, rng: SeededRandom): void {
    this.emitShadow(builder, p);
    const h = p.height;
    PropShapes.frustum(builder, p, h * 0.07, h * 0.04, h * 0.5, 5, p.yaw, this.ramps.trunk);
    const crowns = rng.int(2, 3);
    for (let k = 0; k < crowns; k++) {
      const spread = k === 0 ? 0 : h * 0.17;
      const angle = p.yaw + k * 2.2;
      const center = { x: p.x + spread * M.cos(angle), y: p.y + h * (0.68 - k * 0.07), z: p.z + spread * M.sin(angle) };
      const r = h * (k === 0 ? 0.3 : 0.23);
      PropShapes.blob(builder, center, r, r * 0.85, r, 5, p.yaw + k, this.ramps.leaf, rng, k === 0 ? -0.5 : 0.3);
    }
  }
}

export class PalmProp extends Prop {
  readonly kind = "palm" as const;
  readonly footprint = 3.5;
  readonly minHeight = 13;
  readonly maxHeight = 22;
  readonly triangleCost = 4 * 3 * 2 + 8 * 4 + SHADOW_COST;
  override readonly castsShadow = true;

  emit(builder: FacetMeshBuilder, p: PropPlacement, _rng: SeededRandom): void {
    this.emitShadow(builder, p);
    const h = p.height;
    const bendX = M.cos(p.yaw) * h * 0.2;
    const bendZ = M.sin(p.yaw) * h * 0.2;
    const pointAt = (t: number): Vector3 => ({ x: p.x + bendX * t * t, y: p.y + h * t * 0.88, z: p.z + bendZ * t * t });
    for (let k = 0; k < 4; k++) {
      const base = pointAt(k / 4);
      const top = pointAt((k + 1) / 4);
      PropShapes.frustum(builder, { x: (base.x + top.x) / 2, y: base.y, z: (base.z + top.z) / 2 }, h * (0.055 - k * 0.008), h * (0.047 - k * 0.008), top.y - base.y, 3, p.yaw, this.ramps.trunk);
    }
    const crown = pointAt(1);
    for (let f = 0; f < 8; f++) {
      const angle = p.yaw + (f / 8) * M.TAU;
      const reach = h * 0.34;
      const half = h * 0.055;
      const dirX = M.cos(angle);
      const dirZ = M.sin(angle);
      const mid = { x: crown.x + dirX * reach * 0.6, y: crown.y + h * 0.05, z: crown.z + dirZ * reach * 0.6 };
      const tip = { x: crown.x + dirX * reach, y: crown.y - h * 0.11, z: crown.z + dirZ * reach };
      const left = { x: mid.x - dirZ * half, y: mid.y - h * 0.03, z: mid.z + dirX * half };
      const right = { x: mid.x + dirZ * half, y: mid.y - h * 0.03, z: mid.z - dirX * half };
      const shape = (a: Vector3, b: Vector3, c: Vector3, offset: number): void => builder.facet(a, b, c, this.ramps.frond, offset, false);
      shape(crown, left, mid, 0);
      shape(crown, mid, right, 1);
      shape(left, tip, mid, 0);
      shape(mid, tip, right, 1);
    }
  }
}
