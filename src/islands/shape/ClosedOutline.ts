import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";

/** The non-uniform column angles every ring on one island shares. */
export class AngleTable {
  readonly count: number;
  private readonly angles: Float64Array;
  private readonly cosines: Float64Array;
  private readonly sines: Float64Array;

  constructor(count: number, rng: SeededRandom) {
    this.count = count;
    this.angles = new Float64Array(count);
    this.cosines = new Float64Array(count);
    this.sines = new Float64Array(count);
    const spacing = M.TAU / count;
    for (let i = 0; i < count; i++) {
      const angle = (i + rng.range(-0.35, 0.35)) * spacing;
      this.angles[i] = angle;
      this.cosines[i] = M.cos(angle);
      this.sines[i] = M.sin(angle);
    }
  }

  private wrap(i: number): number {
    return ((i % this.count) + this.count) % this.count;
  }

  angle(i: number): number {
    return this.angles[this.wrap(i)]!;
  }

  cos(i: number): number {
    return this.cosines[this.wrap(i)]!;
  }

  sin(i: number): number {
    return this.sines[this.wrap(i)]!;
  }
}

export interface PlanPoint {
  readonly x: number;
  readonly z: number;
}

function cross(o: PlanPoint, a: PlanPoint, b: PlanPoint): number {
  return (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
}

/** Even-odd test against a closed polygon. */
export function polygonContains(points: readonly PlanPoint[], point: PlanPoint): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]!;
    const b = points[j]!;
    if (a.z > point.z !== b.z > point.z && point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x) inside = !inside;
  }
  return inside;
}

/** Absolute area of a closed polygon. */
export function polygonArea(points: readonly PlanPoint[]): number {
  let twice = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    twice += a.x * b.z - b.x * a.z;
  }
  return Math.abs(twice) / 2;
}

/** Area of a polygon divided by the area of its convex hull. A circle scores about 1. */
export function polygonSolidity(points: readonly PlanPoint[]): number {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.z - b.z);
  const half = (input: readonly PlanPoint[]): PlanPoint[] => {
    const chain: PlanPoint[] = [];
    for (const point of input) {
      while (chain.length >= 2 && cross(chain[chain.length - 2]!, chain[chain.length - 1]!, point) <= 0) chain.pop();
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  const hull = [...half(sorted), ...half([...sorted].reverse())];
  return polygonArea(points) / polygonArea(hull);
}

/** A star-shaped closed polyline r(theta) around the world origin. */
export class ClosedOutline {
  readonly table: AngleTable;
  private readonly radii: Float64Array;

  constructor(table: AngleTable, radiusAt: (column: number) => number) {
    this.table = table;
    this.radii = new Float64Array(table.count);
    for (let i = 0; i < table.count; i++) this.radii[i] = radiusAt(i);
  }

  radius(i: number): number {
    return this.radii[((i % this.table.count) + this.table.count) % this.table.count]!;
  }

  x(i: number): number {
    return this.radius(i) * this.table.cos(i);
  }

  z(i: number): number {
    return this.radius(i) * this.table.sin(i);
  }

  points(): PlanPoint[] {
    const points: PlanPoint[] = [];
    for (let i = 0; i < this.table.count; i++) points.push({ x: this.x(i), z: this.z(i) });
    return points;
  }

  area(): number {
    return polygonArea(this.points());
  }

  contains(x: number, z: number): boolean {
    return polygonContains(this.points(), { x, z });
  }

  /** Shortest plan distance from a point to the polyline. */
  distanceToEdge(x: number, z: number): number {
    let best = Infinity;
    for (let i = 0; i < this.table.count; i++) {
      const ax = this.x(i);
      const az = this.z(i);
      const dx = this.x(i + 1) - ax;
      const dz = this.z(i + 1) - az;
      const lengthSquared = dx * dx + dz * dz;
      const t = lengthSquared === 0 ? 0 : M.clamp(((x - ax) * dx + (z - az) * dz) / lengthSquared, 0, 1);
      const ex = ax + dx * t - x;
      const ez = az + dz * t - z;
      best = Math.min(best, ex * ex + ez * ez);
    }
    return Math.sqrt(best);
  }
}
