import type { ColorRamp, Rgb } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { Vector3 } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { FacetMeshBuilder } from "../mesh/FacetMeshBuilder.ts";
import { Ring, RingStitcher } from "../mesh/RingStitcher.ts";

function circle(x: number, y: number, z: number, radiusX: number, radiusZ: number, sides: number, yaw: number): Ring {
  const points: Vector3[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = yaw + (i / sides) * M.TAU;
    points.push({ x: x + radiusX * M.cos(angle), y, z: z + radiusZ * M.sin(angle) });
  }
  return new Ring(points);
}

/** Primitive solids in code. Each states its triangle cost so props can declare theirs. */
export class PropShapes {
  /** Cost: 2 x sides, or sides when bottomRadius or topRadius is 0; plus sides - 2 with a cap. */
  static frustum(
    builder: FacetMeshBuilder,
    base: Vector3,
    bottomRadius: number,
    topRadius: number,
    height: number,
    sides: number,
    yaw: number,
    ramp: ColorRamp,
    offset = 0,
    cap = false,
  ): void {
    const facet = (a: Vector3, b: Vector3, c: Vector3): void => builder.facet(a, b, c, ramp, offset, false);
    const bottom = circle(base.x, base.y, base.z, bottomRadius, bottomRadius, sides, yaw);
    const topY = base.y + height;
    if (topRadius <= 0) {
      const tip = { x: base.x, y: topY, z: base.z };
      for (let i = 0; i < sides; i++) facet(tip, bottom.at(i + 1), bottom.at(i));
      return;
    }
    const top = circle(base.x, topY, base.z, topRadius, topRadius, sides, yaw);
    RingStitcher.stitch(top, bottom, facet);
    if (cap) for (let i = 1; i < sides - 1; i++) facet(top.at(0), top.at(i + 1), top.at(i));
  }

  /** A faceted lump. Cost: 4 x sides. */
  static blob(
    builder: FacetMeshBuilder,
    center: Vector3,
    radiusX: number,
    radiusY: number,
    radiusZ: number,
    sides: number,
    yaw: number,
    ramp: ColorRamp,
    rng: SeededRandom,
    offset = 0,
  ): void {
    const facet = (a: Vector3, b: Vector3, c: Vector3): void => builder.facet(a, b, c, ramp, offset, false);
    const wobble = rng.range(0.9, 1.1);
    const upper = circle(center.x, center.y + radiusY * 0.35, center.z, radiusX * 0.82 * wobble, radiusZ * 0.82 * wobble, sides, yaw);
    const lower = circle(center.x, center.y - radiusY * 0.4, center.z, radiusX * 0.92, radiusZ * 0.92, sides, yaw + 0.3);
    const top = { x: center.x, y: center.y + radiusY, z: center.z };
    const bottom = { x: center.x, y: center.y - radiusY, z: center.z };
    for (let i = 0; i < sides; i++) facet(top, upper.at(i + 1), upper.at(i));
    RingStitcher.stitch(upper, lower, facet);
    RingStitcher.fanToPoint(lower, bottom, facet);
  }

  /** A pitched roof over an axis-aligned rectangle, turned by yaw. Cost: 6. */
  static gableRoof(builder: FacetMeshBuilder, base: Vector3, halfLength: number, halfWidth: number, height: number, yaw: number, ramp: ColorRamp): void {
    const cos = M.cos(yaw);
    const sin = M.sin(yaw);
    const at = (along: number, across: number, y: number): Vector3 => ({
      x: base.x + along * cos - across * sin,
      y,
      z: base.z + along * sin + across * cos,
    });
    const top = base.y + height;
    const a = at(-halfLength, -halfWidth, base.y);
    const b = at(halfLength, -halfWidth, base.y);
    const c = at(halfLength, halfWidth, base.y);
    const d = at(-halfLength, halfWidth, base.y);
    const ridgeA = at(-halfLength, 0, top);
    const ridgeB = at(halfLength, 0, top);
    const facet = (p: Vector3, q: Vector3, r: Vector3): void => builder.facet(p, q, r, ramp, 0, false);
    facet(ridgeA, ridgeB, a);
    facet(ridgeB, b, a);
    facet(ridgeB, ridgeA, c);
    facet(ridgeA, d, c);
    facet(ridgeB, c, b);
    facet(ridgeA, a, d);
  }

  /** A flat horizontal fan in one colour. Cost: sides - 2. */
  static groundPolygon(builder: FacetMeshBuilder, x: number, y: number, z: number, radius: number, sides: number, yaw: number, rgb: Rgb): void {
    const ring = circle(x, y, z, radius, radius, sides, yaw);
    for (let i = 1; i < sides - 1; i++) builder.flatFacet(ring.at(0), ring.at(i + 1), ring.at(i), rgb);
  }
}
