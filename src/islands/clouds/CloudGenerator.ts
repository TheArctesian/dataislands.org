import { ColorRamp, type Rgb } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { IsoProjection } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import { CLOUD_TRIANGLE_CAP, type IslandScale } from "../input/IslandScale.ts";
import type { TerraceStack } from "../shape/TerraceStack.ts";
import type { UndersideProfile } from "../shape/UndersideProfile.ts";

export const CLOUD_LAYERS = ["below", "waist", "front"] as const;
export type CloudLayer = (typeof CLOUD_LAYERS)[number];

export interface CloudPuff {
  readonly layer: CloudLayer;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly radiusZ: number;
  readonly yaw: number;
}

export interface PuffTemplate {
  /** Non-indexed unit dome. */
  readonly positions: Float32Array;
  /** sRGB bytes, one flat colour per facet. */
  readonly colors: Uint8Array;
  readonly triangleCount: number;
}

const TOP: Rgb = ColorRamp.parse("#FFFDF8");
const MIDDLE: Rgb = ColorRamp.parse("#F3EDE3");
const SHADE: Rgb = ColorRamp.parse("#DDD4C8");
const BELLY: Rgb = ColorRamp.parse("#C3BBB4");
const PUFF_SIDES = 8;
const MIN_PUFFS = 12;
const PUFF_TRIANGLES = PUFF_SIDES * 5;
const MAX_PUFFS = Math.floor(CLOUD_TRIANGLE_CAP / PUFF_TRIANGLES);
/** Radius and height of each ring of the dome, from its flat base up. The base is left open, because the camera never sees it. */
const PUFF_RINGS: readonly (readonly [number, number])[] = [[0.86, -0.25], [1, 0.2], [0.68, 0.68]];
/** A dome's screen outline is centred this far up its height, in radiusY. */
const DOME_LIFT = 0.37;
/** Clearance for idle drift, in world units. */
const DRIFT_PAD = 3;
/** Rings at least this deep count as the lower taper. */
const LOWER_TAPER = 0.45;
const PERIMETER_SAMPLES = 12;
const ROOT_HALF = Math.sqrt(0.5);

interface ScreenPoint {
  readonly u: number;
  readonly v: number;
}

interface ScreenPolygon {
  readonly u: readonly number[];
  readonly v: readonly number[];
}

function cross(o: ScreenPoint, a: ScreenPoint, b: ScreenPoint): number {
  return (a.u - o.u) * (b.v - o.v) - (a.v - o.v) * (b.u - o.u);
}

function convexHull(points: readonly ScreenPoint[]): ScreenPolygon {
  const sorted = [...points].sort((a, b) => a.u - b.u || a.v - b.v);
  const half = (input: readonly ScreenPoint[]): ScreenPoint[] => {
    const chain: ScreenPoint[] = [];
    for (const point of input) {
      while (chain.length >= 2 && cross(chain[chain.length - 2]!, chain[chain.length - 1]!, point) <= 0) chain.pop();
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  const hull = [...half(sorted), ...half([...sorted].reverse())];
  return { u: hull.map((p) => p.u), v: hull.map((p) => p.v) };
}

function buildTemplate(): PuffTemplate {
  const sun = IsoProjection.SUN;
  const corner = (ring: number, side: number): readonly [number, number, number] => {
    const [radius, y] = PUFF_RINGS[ring]!;
    const angle = (side / PUFF_SIDES) * M.TAU;
    return [radius * M.cos(angle), y, radius * M.sin(angle)];
  };
  const triangles: (readonly [number, number, number])[][] = [];
  for (let side = 0; side < PUFF_SIDES; side++) {
    triangles.push([[0, 1, 0], corner(2, side + 1), corner(2, side)]);
    for (let ring = 2; ring > 0; ring--) {
      triangles.push([corner(ring, side), corner(ring, side + 1), corner(ring - 1, side)]);
      triangles.push([corner(ring, side + 1), corner(ring - 1, side + 1), corner(ring - 1, side)]);
    }
  }
  const positions = new Float32Array(PUFF_TRIANGLES * 9);
  const colors = new Uint8Array(PUFF_TRIANGLES * 9);
  triangles.forEach((triangle, f) => {
    const [a, b, c] = triangle as [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]];
    positions.set([...a, ...b, ...c], f * 9);
    const x = (a[0] + b[0] + c[0]) / 3;
    const rise = (a[1] + b[1] + c[1]) / 3;
    const z = (a[2] + b[2] + c[2]) / 3;
    const lit = x * sun.x + z * sun.z;
    const rgb = rise < 0.1 ? (lit > 0.2 ? SHADE : BELLY) : rise < 0.55 ? (lit > 0 ? TOP : lit > -0.45 ? MIDDLE : SHADE) : lit > -0.2 ? TOP : MIDDLE;
    for (let i = 0; i < 3; i++) colors.set(rgb, f * 9 + i * 3);
  });
  return { positions, colors, triangleCount: PUFF_TRIANGLES };
}

/** Three layers of opaque puffs. The source art has no clouds, so this design is new. */
export class CloudGenerator {
  static readonly PUFF: PuffTemplate = buildTemplate();

  private readonly stack: TerraceStack;
  private readonly profile: UndersideProfile;
  private readonly scale: IslandScale;
  private readonly rng: SeededRandom;
  private readonly keepOff: readonly ScreenPolygon[];
  private readonly lowerTaper: ScreenPolygon;
  private readonly taperDepth: number;

  constructor(stack: TerraceStack, profile: UndersideProfile, scale: IslandScale, rng: SeededRandom) {
    this.stack = stack;
    this.profile = profile;
    this.scale = scale;
    this.rng = rng;
    this.keepOff = this.protectedPolygons();
    this.lowerTaper = this.lowerTaperHull();
    const view = IsoProjection.TO_CAMERA;
    this.taperDepth = profile.apex.x * view.x + profile.apex.y * view.y + profile.apex.z * view.z;
  }

  generate(): readonly CloudPuff[] {
    const budget = M.round(M.lerp(MIN_PUFFS, MAX_PUFFS, this.scale.fraction));
    const puffs: CloudPuff[] = [];
    const clumps: readonly { layer: CloudLayer; share: number }[] = [
      { layer: "below", share: 0.45 },
      { layer: "waist", share: 0.4 },
      { layer: "front", share: 0.15 },
    ];
    for (const { layer, share } of clumps) {
      const quota = Math.max(3, Math.floor(budget * share));
      const before = puffs.length;
      let tries = quota * 8;
      while (puffs.length - before < quota && puffs.length < MAX_PUFFS && tries-- > 0) this.addClump(layer, puffs, before + quota);
    }
    return puffs;
  }

  private addClump(layer: CloudLayer, puffs: CloudPuff[], limit: number): void {
    const R = this.stack.radius;
    const bottom = this.stack.tier(0).footY;
    const depth = this.profile.depth;
    const angle = this.rng.range(0, M.TAU);
    let center: { x: number; y: number; z: number };
    if (layer === "below") {
      const reach = R * this.rng.range(0.2, 0.95);
      center = { x: reach * M.cos(angle), y: bottom - depth * this.rng.range(0.6, 1.0), z: reach * M.sin(angle) };
    } else if (layer === "waist") {
      const reach = R * this.rng.range(0.9, 1.15);
      center = { x: reach * M.cos(angle), y: bottom - depth * this.rng.range(0.2, 0.55), z: reach * M.sin(angle) };
    } else {
      const toward = R * this.rng.range(0.4, 0.75);
      const across = R * this.rng.range(-0.4, 0.4);
      center = {
        x: this.profile.apex.x - toward + across,
        y: bottom - depth * this.rng.range(0.7, 1.0),
        z: this.profile.apex.z - toward - across,
      };
    }
    const size = M.lerp(6, 14, this.scale.fraction) * this.rng.range(0.85, 1.2);
    const lobes = this.rng.int(3, 5);
    const clump: CloudPuff[] = [];
    for (let k = 0; k < lobes; k++) {
      // Lobes line up across the screen, tallest in the middle, on one shared flat base.
      const along = k - (lobes - 1) / 2;
      const spread = (size * along * this.rng.range(0.8, 1.05)) * ROOT_HALF;
      const nudge = size * this.rng.range(-0.25, 0.25);
      const radius = size * (1 - (0.42 * Math.abs(along)) / ((lobes - 1) / 2)) * this.rng.range(0.88, 1.05);
      const radiusY = radius * 0.82;
      clump.push({
        layer,
        x: M.snap(center.x - spread + nudge),
        y: M.snap(center.y + radiusY * 0.25),
        z: M.snap(center.z + spread + nudge),
        radiusX: radius * 1.05,
        radiusY,
        radiusZ: radius * 1.05,
        yaw: this.rng.range(-0.2, 0.2),
      });
    }
    if (puffs.length + clump.length > Math.min(limit, MAX_PUFFS)) return;
    if (!clump.some((puff) => this.overlapsProtected(puff))) puffs.push(...clump);
  }

  /** The terraces and the upper part of the base cliff, projected to the screen. */
  private protectedPolygons(): readonly ScreenPolygon[] {
    const polygons: ScreenPolygon[] = [];
    const add = (points: readonly { x: number; z: number }[], y: number): void => {
      polygons.push({
        u: points.map((p) => IsoProjection.screenU(p.x, y, p.z)),
        v: points.map((p) => IsoProjection.screenV(p.x, y, p.z)),
      });
    };
    for (const tier of this.stack.tiers) add(tier.rim.points(), tier.y);
    const base = this.stack.tier(0);
    add(base.foot.points(), base.footY);
    return polygons;
  }

  /** The lower keel and any hanging tips, which must keep their points in view. */
  private lowerTaperHull(): ScreenPolygon {
    const points: ScreenPoint[] = [];
    const add = (x: number, y: number, z: number): void => {
      points.push({ u: IsoProjection.screenU(x, y, z), v: IsoProjection.screenV(x, y, z) });
    };
    const table = this.stack.tier(0).foot.table;
    for (const ring of this.profile.rings) {
      if (ring.depthFraction < LOWER_TAPER) continue;
      ring.radii.forEach((radius, k) => add(ring.centerX + radius * table.cos(k * ring.stride), ring.y, ring.centerZ + radius * table.sin(k * ring.stride)));
    }
    add(this.profile.apex.x, this.profile.apex.y, this.profile.apex.z);
    for (const tip of this.profile.tips) add(tip.x, tip.y - tip.length, tip.z);
    return convexHull(points);
  }

  /** Whether a puff in front of the keel would cut across its lower part. Puffs behind it are fine. */
  private coversTaper(puff: CloudPuff, u: number, v: number, a: number, b: number): boolean {
    const view = IsoProjection.TO_CAMERA;
    if (puff.x * view.x + puff.y * view.y + puff.z * view.z <= this.taperDepth) return false;
    const reachA = a + DRIFT_PAD;
    const reachB = b + DRIFT_PAD;
    for (let i = 0; i < this.lowerTaper.u.length; i++) {
      const du = (this.lowerTaper.u[i]! - u) / reachA;
      const dv = (this.lowerTaper.v[i]! - v) / reachB;
      if (du * du + dv * dv <= 1) return true;
    }
    for (let i = 0; i < PERIMETER_SAMPLES; i++) {
      const angle = (i / PERIMETER_SAMPLES) * M.TAU;
      if (CloudGenerator.inside(this.lowerTaper, u + reachA * M.cos(angle), v + reachB * M.sin(angle))) return true;
    }
    return CloudGenerator.inside(this.lowerTaper, u, v);
  }

  private overlapsProtected(puff: CloudPuff): boolean {
    const u = IsoProjection.screenU(puff.x, puff.y, puff.z);
    const v = IsoProjection.screenV(puff.x, puff.y + puff.radiusY * DOME_LIFT, puff.z);
    if (this.coversTaper(puff, u, v, puff.radiusX, puff.radiusX * 0.35 + puff.radiusY * 0.62)) return true;
    const samples = 8;
    for (let i = 0; i <= samples; i++) {
      const angle = (i / samples) * M.TAU;
      const reach = i === samples ? 0 : 1;
      const su = u + reach * puff.radiusX * M.cos(angle);
      const sv = v + reach * (puff.radiusX * 0.35 + puff.radiusY * 0.87) * M.sin(angle);
      for (const polygon of this.keepOff) if (CloudGenerator.inside(polygon, su, sv)) return true;
    }
    return false;
  }

  private static inside(polygon: ScreenPolygon, u: number, v: number): boolean {
    let inside = false;
    const count = polygon.u.length;
    for (let i = 0, j = count - 1; i < count; j = i++) {
      const vi = polygon.v[i]!;
      const vj = polygon.v[j]!;
      if (vi > v !== vj > v && u < ((polygon.u[j]! - polygon.u[i]!) * (v - vi)) / (vj - vi) + polygon.u[i]!) inside = !inside;
    }
    return inside;
  }
}
