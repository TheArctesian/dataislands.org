import { FrontSide, MeshBasicMaterial } from "three";

/** Shared unlit materials. Light is baked into vertex colours, so no scene light may touch them. */
export class MaterialLibrary {
  readonly facets = new MeshBasicMaterial({ vertexColors: true, side: FrontSide });

  dispose(): void {
    this.facets.dispose();
  }
}

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Shading happens in sRGB bytes. The renderer works in linear, so convert once at upload. */
export function linearColors(bytes: Uint8Array): Float32Array {
  const out = new Float32Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = SRGB_TO_LINEAR[bytes[i]!]!;
  return out;
}
