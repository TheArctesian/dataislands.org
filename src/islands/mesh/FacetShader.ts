import type { ColorRamp, Rgb } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { IsoProjection } from "../core/IsoProjection.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";

const ROOT_HALF = Math.sqrt(0.5);
const BOUNCE_MIN = 0.12;
const BOUNCE_RANGE = 0.6;

/** Bakes light by handing each facet one rung of a ramp. Nothing re-shades it at render time. */
export class FacetShader {
  private readonly rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /** Normal must be unit length. `offset` may be fractional; the sum is rounded to a rung. */
  shade(ramp: ColorRamp, nx: number, ny: number, nz: number, offset: number, jitter: boolean): Rgb {
    const sun = IsoProjection.SUN;
    const lambert = Math.max(0, nx * sun.x + ny * sun.y + nz * sun.z);
    const roll = this.rng.next();
    const hash = !jitter ? 0 : roll < 0.15 ? -1 : roll > 0.85 ? 1 : 0;
    return ramp.at(M.round((1 - lambert) * (ramp.length - 1) + offset) + hash);
  }

  /**
   * For faces the sun misses. Bounce light from the clouds separates them by which way they
   * turn on screen, so an underside shows facets instead of one dark rung.
   */
  shadeBelow(ramp: ColorRamp, nx: number, ny: number, nz: number, offset: number): Rgb {
    const sun = IsoProjection.SUN;
    const lambert = Math.max(0, nx * sun.x + ny * sun.y + nz * sun.z);
    const turn = (nx - nz) * ROOT_HALF;
    const bounce = BOUNCE_MIN + BOUNCE_RANGE * (0.5 + 0.5 * turn);
    const roll = this.rng.next();
    const hash = roll < 0.12 ? -1 : roll > 0.88 ? 1 : 0;
    return ramp.at(M.round((1 - Math.max(lambert, bounce)) * (ramp.length - 1) + offset) + hash);
  }
}
