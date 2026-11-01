import { BufferAttribute, BufferGeometry, Mesh } from "three";
import type { IslandModel } from "../IslandModel.ts";
import { linearColors, type MaterialLibrary } from "./MaterialLibrary.ts";

/** One merged mesh holding terrain and props. */
export class IslandView {
  readonly mesh: Mesh;
  private readonly geometry: BufferGeometry;

  constructor(model: IslandModel, materials: MaterialLibrary) {
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new BufferAttribute(model.positions, 3));
    this.geometry.setAttribute("color", new BufferAttribute(linearColors(model.colors), 3));
    this.mesh = new Mesh(this.geometry, materials.facets);
    this.mesh.frustumCulled = false;
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
