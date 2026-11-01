export type Rgb = readonly [number, number, number];

/** Colours ordered lightest to darkest. A facet is handed one rung, never a blend. */
export class ColorRamp {
  private readonly rungs: Rgb[];

  constructor(hexes: readonly string[]) {
    if (hexes.length === 0) throw new Error("a colour ramp needs at least one colour");
    this.rungs = hexes.map(ColorRamp.parse);
  }

  static parse(hex: string): Rgb {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`invalid colour ${hex}`);
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  get length(): number {
    return this.rungs.length;
  }

  /** Out-of-range rungs clamp to the ends of the ramp. */
  at(rung: number): Rgb {
    const index = rung < 0 ? 0 : rung >= this.rungs.length ? this.rungs.length - 1 : rung;
    return this.rungs[index]!;
  }
}
