export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

const DURATION_MS = 220;
const EASING = "cubic-bezier(.2,.7,.2,1)";

/** Where a box measured inside a scaling parent will sit once that parent reaches full size. */
export function restingRect(box: Box, origin: { x: number; y: number }, scale: number): Box {
  return {
    left: origin.x + (box.left - origin.x) / scale,
    top: origin.y + (box.top - origin.y) / scale,
    width: box.width / scale,
    height: box.height / scale,
  };
}

/** Moves a box drawn at `to` so that it starts over `from`. */
export function flightFrames(from: Box, to: Box): Keyframe[] {
  const place = (box: Box) => `translate(${box.left}px, ${box.top}px) scale(${box.width / to.width})`;
  return [{ transform: place(from) }, { transform: place(to) }];
}

export function isInside(box: Box, frame: Box): boolean {
  return box.width > 0 && box.left >= frame.left && box.top >= frame.top
    && box.left + box.width <= frame.left + frame.width && box.top + box.height <= frame.top + frame.height;
}

const screen = (): Box => ({ left: 0, top: 0, width: innerWidth, height: innerHeight });

/** Flies a copy of an icon above the open dialog. Coming back mid-flight reverses from where it has got to. */
export class IconFlight {
  private animation: Animation | null = null;
  private source: HTMLElement | null = null;

  private readonly sky: HTMLElement;

  constructor(sky: HTMLElement) {
    this.sky = sky;
  }

  depart(source: HTMLElement, title: HTMLElement, from: Box, to: Box): void {
    this.settle();
    this.source = source;
    this.launch(title, from, to, () => this.end(title));
    source.style.visibility = "hidden";
    title.style.visibility = "hidden";
  }

  comeBack(title: HTMLElement, sheet: Box): void {
    const source = this.source;
    if (!source) return;
    if (this.animation) {
      this.animation.onfinish = () => {
        title.style.visibility = "";
        this.end(source);
      };
      this.animation.reverse();
      return;
    }
    const from = title.getBoundingClientRect();
    const to = source.isConnected ? source.getBoundingClientRect() : null;
    if (!to || !isInside(from, sheet) || !isInside(to, screen())) {
      this.end(source);
      return;
    }
    this.launch(title, from, to, () => {
      title.style.visibility = "";
      this.end(source);
    });
    title.style.visibility = "hidden";
  }

  private launch(art: HTMLElement, from: Box, to: Box, finished: () => void): void {
    const ghost = art.cloneNode(true) as HTMLElement;
    ghost.style.cssText = `visibility:visible;position:fixed;left:0;top:0;width:${to.width}px;height:${to.height}px;transform-origin:0 0`;
    this.sky.replaceChildren(ghost);
    this.sky.showPopover();
    this.animation = ghost.animate(flightFrames(from, to), { duration: DURATION_MS, easing: EASING, fill: "both" });
    this.animation.onfinish = finished;
  }

  private end(arrived: HTMLElement): void {
    arrived.style.visibility = "";
    this.animation = null;
    this.sky.replaceChildren();
    if (this.sky.matches(":popover-open")) this.sky.hidePopover();
    if (arrived === this.source) this.source = null;
  }

  private settle(): void {
    this.animation?.cancel();
    if (this.source) this.source.style.visibility = "";
    this.animation = null;
    this.source = null;
  }
}
