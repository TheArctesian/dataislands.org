import type { SeededRandom } from "./SeededRandom.ts";

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value noise on a closed loop: sample(0) equals sample(1). Output is in [-1, 1]. */
export class PeriodicNoise {
  private readonly knots: number[];

  constructor(rng: SeededRandom, knotCount: number) {
    this.knots = [];
    for (let i = 0; i < knotCount; i++) this.knots.push(rng.range(-1, 1));
  }

  sample(t: number): number {
    const count = this.knots.length;
    const scaled = (t - Math.floor(t)) * count;
    const index = Math.floor(scaled);
    const a = this.knots[index % count]!;
    const b = this.knots[(index + 1) % count]!;
    return a + (b - a) * smooth(scaled - index);
  }
}

/** Lattice value noise for meadow and forest patches. Output is in [0, 1]. */
export class ValueNoise2D {
  private readonly salt: number;
  private readonly cell: number;

  constructor(rng: SeededRandom, cell: number) {
    this.salt = rng.nextUint32();
    this.cell = cell;
  }

  sample(x: number, z: number): number {
    const u = x / this.cell;
    const v = z / this.cell;
    const iu = Math.floor(u);
    const iv = Math.floor(v);
    const fu = smooth(u - iu);
    const fv = smooth(v - iv);
    const top = this.lattice(iu, iv) * (1 - fu) + this.lattice(iu + 1, iv) * fu;
    const bottom = this.lattice(iu, iv + 1) * (1 - fu) + this.lattice(iu + 1, iv + 1) * fu;
    return top * (1 - fv) + bottom * fv;
  }

  private lattice(u: number, v: number): number {
    let h = Math.imul(u, 0x27d4eb2d) ^ Math.imul(v, 0x165667b1) ^ this.salt;
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
}
