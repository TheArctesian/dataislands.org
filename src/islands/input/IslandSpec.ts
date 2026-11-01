import type { IslandTheme } from "./IslandTheme.ts";

export interface IslandInput {
  readonly seed: number;
  readonly size: number;
  readonly theme: IslandTheme;
}

export class IslandSpec implements IslandInput {
  readonly seed: number;
  readonly size: number;
  readonly theme: IslandTheme;

  constructor(input: IslandInput) {
    if (!Number.isInteger(input.seed) || input.seed < 0 || input.seed > 0xffffffff) {
      throw new RangeError(`seed must be a uint32, got ${input.seed}`);
    }
    if (!Number.isFinite(input.size) || input.size < 0) {
      throw new RangeError(`size must be a finite number >= 0, got ${input.size}`);
    }
    this.seed = input.seed;
    this.size = input.size;
    this.theme = input.theme;
  }
}
