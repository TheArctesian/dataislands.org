import type { Vector3 } from "../core/IsoProjection.ts";

export class Ring {
  private readonly points: readonly Vector3[];

  constructor(points: readonly Vector3[]) {
    this.points = points;
  }

  get count(): number {
    return this.points.length;
  }

  at(i: number): Vector3 {
    return this.points[i % this.points.length]!;
  }
}

export type TriangleSink = (a: Vector3, b: Vector3, c: Vector3) => void;

/**
 * Joins two closed rings. `first` lies nearer the island's top centre along the shell,
 * which makes every triangle face outward. Column counts must match or differ by exactly 2:1.
 */
export class RingStitcher {
  static stitch(first: Ring, second: Ring, emit: TriangleSink): void {
    if (first.count === second.count) {
      for (let i = 0; i < first.count; i++) {
        emit(first.at(i), first.at(i + 1), second.at(i));
        emit(first.at(i + 1), second.at(i + 1), second.at(i));
      }
    } else if (first.count === second.count * 2) {
      for (let k = 0; k < second.count; k++) {
        const i = k * 2;
        emit(first.at(i), first.at(i + 1), second.at(k));
        emit(first.at(i + 1), first.at(i + 2), second.at(k + 1));
        emit(first.at(i + 1), second.at(k + 1), second.at(k));
      }
    } else if (first.count * 2 === second.count) {
      for (let k = 0; k < first.count; k++) {
        const i = k * 2;
        emit(first.at(k), first.at(k + 1), second.at(i + 1));
        emit(first.at(k), second.at(i + 1), second.at(i));
        emit(first.at(k + 1), second.at(i + 2), second.at(i + 1));
      }
    } else {
      throw new Error(`cannot stitch rings of ${first.count} and ${second.count} columns`);
    }
  }

  static fanToPoint(ring: Ring, point: Vector3, emit: TriangleSink): void {
    for (let i = 0; i < ring.count; i++) emit(ring.at(i), ring.at(i + 1), point);
  }
}
