import { CloudGenerator, type CloudPuff } from "./clouds/CloudGenerator.ts";
import { IsoProjection, type ScreenBounds } from "./core/IsoProjection.ts";
import type { LayerName, LayerRange } from "./mesh/FacetMeshBuilder.ts";
import type { PropPlacement } from "./props/Prop.ts";

export interface IslandModelData {
  /** Non-indexed, nine numbers per triangle. */
  readonly positions: Float32Array;
  /** sRGB bytes, nine per triangle, one flat colour per facet. */
  readonly colors: Uint8Array;
  readonly layers: Readonly<Record<LayerName, LayerRange>>;
  /** Triangles before camera culling, which is what the budget limits. */
  readonly offeredTriangles: number;
  readonly placements: readonly PropPlacement[];
  readonly puffs: readonly CloudPuff[];
}

function fnv(hash: number, bytes: Uint8Array): number {
  let h = hash;
  for (const byte of bytes) {
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Plain generated data. No normals are stored, because light is already baked. */
export class IslandModel implements IslandModelData {
  readonly positions: Float32Array;
  readonly colors: Uint8Array;
  readonly layers: Readonly<Record<LayerName, LayerRange>>;
  readonly offeredTriangles: number;
  readonly placements: readonly PropPlacement[];
  readonly puffs: readonly CloudPuff[];
  readonly triangleCount: number;
  readonly cloudTriangleCount: number;
  readonly screenBounds: ScreenBounds;
  /** FNV-1a over the geometry and puffs. */
  readonly checksum: number;

  constructor(data: IslandModelData) {
    this.positions = data.positions;
    this.colors = data.colors;
    this.layers = data.layers;
    this.offeredTriangles = data.offeredTriangles;
    this.placements = data.placements;
    this.puffs = data.puffs;
    this.triangleCount = data.positions.length / 9;
    this.cloudTriangleCount = data.puffs.length * CloudGenerator.PUFF.triangleCount;
    this.screenBounds = this.measure();
    const puffNumbers = new Float32Array(data.puffs.flatMap((p) => [p.x, p.y, p.z, p.radiusX, p.radiusY, p.radiusZ, p.yaw]));
    let hash = fnv(0x811c9dc5, new Uint8Array(data.positions.buffer, data.positions.byteOffset, data.positions.byteLength));
    hash = fnv(hash, data.colors);
    this.checksum = fnv(hash, new Uint8Array(puffNumbers.buffer));
  }

  private measure(): ScreenBounds {
    let minU = Infinity;
    let maxU = -Infinity;
    let minV = Infinity;
    let maxV = -Infinity;
    const take = (x: number, y: number, z: number): void => {
      const u = IsoProjection.screenU(x, y, z);
      const v = IsoProjection.screenV(x, y, z);
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    };
    for (let i = 0; i < this.positions.length; i += 3) take(this.positions[i]!, this.positions[i + 1]!, this.positions[i + 2]!);
    for (const puff of this.puffs) {
      take(puff.x + puff.radiusX, puff.y, puff.z - puff.radiusZ);
      take(puff.x - puff.radiusX, puff.y, puff.z + puff.radiusZ);
      take(puff.x, puff.y - puff.radiusY, puff.z);
      take(puff.x, puff.y + puff.radiusY, puff.z);
    }
    return { minU, maxU, minV, maxV };
  }
}
