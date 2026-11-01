import type { ScreenBounds } from "../core/IsoProjection.ts";

const MARGIN = 1.06;

/** The framing rule, apart from three.js, so page layout can line up with the rendered island. */
export class IsoFraming {
  /** The half-height of the view needed to fit bounds in a viewport of this aspect. */
  static halfHeightFor(bounds: ScreenBounds, aspect: number): number {
    return Math.max((bounds.maxV - bounds.minV) / 2, (bounds.maxU - bounds.minU) / 2 / aspect) * MARGIN;
  }
}
