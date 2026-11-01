/** A view of a world that fills the viewport at zoom 1. Immutable, and never shows past the world's edge. */
export class PanZoomView {
  readonly zoom: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly maxZoom: number;

  constructor(width: number, height: number, maxZoom: number, zoom = 1, x = 0, y = 0) {
    this.width = width;
    this.height = height;
    this.maxZoom = Math.max(1, maxZoom);
    this.zoom = Math.min(this.maxZoom, Math.max(1, zoom));
    this.x = Math.min(0, Math.max(width - width * this.zoom, x));
    this.y = Math.min(0, Math.max(height - height * this.zoom, y));
  }

  panBy(dx: number, dy: number): PanZoomView {
    return new PanZoomView(this.width, this.height, this.maxZoom, this.zoom, this.x + dx, this.y + dy);
  }

  /** Keeps the world point under (px, py) in the same place on screen. */
  zoomAt(px: number, py: number, factor: number): PanZoomView {
    const zoom = Math.min(this.maxZoom, Math.max(1, this.zoom * factor));
    const ratio = zoom / this.zoom;
    return new PanZoomView(this.width, this.height, this.maxZoom, zoom, px - (px - this.x) * ratio, py - (py - this.y) * ratio);
  }

  /** Brings a world position, given as fractions, to the middle of the viewport. */
  centredOn(fractionX: number, fractionY: number): PanZoomView {
    const x = this.width / 2 - fractionX * this.width * this.zoom;
    const y = this.height / 2 - fractionY * this.height * this.zoom;
    return new PanZoomView(this.width, this.height, this.maxZoom, this.zoom, x, y);
  }

  get isZoomedIn(): boolean {
    return this.zoom > 1;
  }
}
