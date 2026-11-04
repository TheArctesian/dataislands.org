/** How far past the whole island a pinch must go, so one that merely reaches it does not leave the page. */
const LEAVE_AT = -Math.log(0.65);
const LARGEST_SHRINK = 0.3;

/** The pinch left over once the view is fully zoomed out. Immutable, like the view it follows. */
export class ZoomOutPull {
  readonly stretch: number;

  constructor(stretch = 0) {
    this.stretch = Math.max(0, stretch);
  }

  /** Returns the pull after this pinch, and the part of the pinch the view should still apply. */
  by(zoom: number, factor: number): { pull: ZoomOutPull; factor: number } {
    if (factor < 1) return { pull: new ZoomOutPull(this.stretch - Math.log(Math.min(1, zoom * factor))), factor };
    const spent = Math.min(this.stretch, Math.log(factor));
    return { pull: new ZoomOutPull(this.stretch - spent), factor: factor / Math.exp(spent) };
  }

  get isPulling(): boolean {
    return this.stretch > 0;
  }

  get willLeave(): boolean {
    return this.stretch >= LEAVE_AT;
  }

  /** The island gives way less and less the further it goes. */
  get scale(): number {
    return 1 - LARGEST_SHRINK * (1 - Math.exp(-2 * this.stretch));
  }
}
