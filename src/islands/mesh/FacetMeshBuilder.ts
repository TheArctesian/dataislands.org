import type { ColorRamp, Rgb } from "../core/ColorRamp.ts";
import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { IsoProjection, type Vector3 } from "../core/IsoProjection.ts";
import type { FacetShader } from "./FacetShader.ts";

export const LAYER_NAMES = ["surface", "cliff", "underside", "tips", "props"] as const;
export type LayerName = (typeof LAYER_NAMES)[number];

export interface LayerRange {
  readonly start: number;
  readonly count: number;
}

export interface FacetMeshOptions {
  /** Drop facets facing away from the fixed camera. Defaults to true. */
  readonly cull?: boolean;
}

/** Collects non-indexed flat facets, one layer after another. */
export class FacetMeshBuilder {
  /** Facets offered before culling. This is what the budget counts, so it holds in either mode. */
  offered = 0;
  private readonly shader: FacetShader;
  private readonly cull: boolean;
  private positions = new Float32Array(9 * 1024);
  private colors = new Uint8Array(9 * 1024);
  private count = 0;
  private current: LayerName = "surface";
  private readonly ranges = new Map<LayerName, LayerRange>();
  private pivot: Vector3 = { x: 0, y: 0, z: 0 };
  private factor = 1;

  constructor(shader: FacetShader, options: FacetMeshOptions = {}) {
    this.shader = shader;
    this.cull = options.cull ?? true;
  }

  layer(name: LayerName, build: () => void): void {
    this.current = name;
    const start = this.count;
    build();
    this.ranges.set(name, { start, count: this.count - start });
  }

  /** Everything built inside is scaled uniformly about the pivot. Normals are unaffected. */
  scaled(pivot: Vector3, factor: number, build: () => void): void {
    this.pivot = pivot;
    this.factor = factor;
    build();
    this.factor = 1;
  }

  private place(p: Vector3): Vector3 {
    if (this.factor === 1) return p;
    return {
      x: this.pivot.x + (p.x - this.pivot.x) * this.factor,
      y: this.pivot.y + (p.y - this.pivot.y) * this.factor,
      z: this.pivot.z + (p.z - this.pivot.z) * this.factor,
    };
  }

  /** Winding is counter-clockwise seen from outside. */
  facet(a: Vector3, b: Vector3, c: Vector3, ramp: ColorRamp, offset = 0, jitter = true): void {
    this.offered++;
    const normal = FacetMeshBuilder.normal(a, b, c);
    const rgb = this.shader.shade(ramp, normal.x, normal.y, normal.z, offset, jitter);
    this.write(a, b, c, normal, rgb);
  }

  /** A facet on the underside, lit by bounce light as well as the sun. */
  undersideFacet(a: Vector3, b: Vector3, c: Vector3, ramp: ColorRamp, offset = 0): void {
    this.offered++;
    const normal = FacetMeshBuilder.normal(a, b, c);
    this.write(a, b, c, normal, this.shader.shadeBelow(ramp, normal.x, normal.y, normal.z, offset));
  }

  /** A facet with a colour already chosen, such as a ground shadow. */
  flatFacet(a: Vector3, b: Vector3, c: Vector3, rgb: Rgb): void {
    this.offered++;
    this.write(a, b, c, FacetMeshBuilder.normal(a, b, c), rgb);
  }

  range(name: LayerName): LayerRange {
    return this.ranges.get(name) ?? { start: this.count, count: 0 };
  }

  get triangleCount(): number {
    return this.count;
  }

  positionArray(): Float32Array {
    return this.positions.slice(0, this.count * 9);
  }

  colorArray(): Uint8Array {
    return this.colors.slice(0, this.count * 9);
  }

  private static normal(a: Vector3, b: Vector3, c: Vector3): Vector3 {
    const ux = b.x - a.x;
    const uy = b.y - a.y;
    const uz = b.z - a.z;
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const vz = c.z - a.z;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
    return length === 0 ? { x: 0, y: 1, z: 0 } : { x: nx / length, y: ny / length, z: nz / length };
  }

  private write(rawA: Vector3, rawB: Vector3, rawC: Vector3, normal: Vector3, rgb: Rgb): void {
    if (this.cull && !IsoProjection.facesCamera(normal.x, normal.y, normal.z)) return;
    const a = this.place(rawA);
    const b = this.place(rawB);
    const c = this.place(rawC);
    const coordinates = [M.snap(a.x), M.snap(a.y), M.snap(a.z), M.snap(b.x), M.snap(b.y), M.snap(b.z), M.snap(c.x), M.snap(c.y), M.snap(c.z)] as const;
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = coordinates;
    const collapsed = (ax === bx && ay === by && az === bz) || (bx === cx && by === cy && bz === cz) || (ax === cx && ay === cy && az === cz);
    if (collapsed) return;
    if ((this.count + 1) * 9 > this.positions.length) this.grow();
    const base = this.count * 9;
    this.positions.set(coordinates, base);
    for (let vertex = 0; vertex < 3; vertex++) this.colors.set(rgb, base + vertex * 3);
    this.count++;
  }

  private grow(): void {
    const positions = new Float32Array(this.positions.length * 2);
    positions.set(this.positions);
    this.positions = positions;
    const colors = new Uint8Array(this.colors.length * 2);
    colors.set(this.colors);
    this.colors = colors;
  }
}
