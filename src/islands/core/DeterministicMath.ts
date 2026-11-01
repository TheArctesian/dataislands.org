const PI = 3.141592653589793;
const TAU = 6.283185307179586;
const SNAP = 256;

/** Engine libm results differ across platforms, so generation uses these polynomials. */
export class DeterministicMath {
  static readonly PI = PI;
  static readonly TAU = TAU;

  static sin(x: number): number {
    let r = x - TAU * Math.floor(x / TAU + 0.5);
    if (r > PI / 2) r = PI - r;
    else if (r < -PI / 2) r = -PI - r;
    const q = r * r;
    return r * (1 + q * (-1 / 6 + q * (1 / 120 + q * (-1 / 5040 + q * (1 / 362880 + q * (-1 / 39916800 + q / 6227020800))))));
  }

  static cos(x: number): number {
    return DeterministicMath.sin(x + PI / 2);
  }

  static clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x;
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static round(x: number): number {
    return Math.floor(x + 0.5);
  }

  static snap(x: number): number {
    return Math.floor(x * SNAP + 0.5) / SNAP;
  }
}
