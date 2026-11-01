import { BufferAttribute, BufferGeometry, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { CLOUD_LAYERS, CloudGenerator, type CloudLayer, type CloudPuff } from "../clouds/CloudGenerator.ts";
import { linearColors, type MaterialLibrary } from "./MaterialLibrary.ts";

/** Up to one InstancedMesh per cloud layer, all sharing the puff template. */
export class CloudView {
  readonly layers: readonly { readonly layer: CloudLayer; readonly mesh: InstancedMesh }[];
  private readonly geometry: BufferGeometry;

  constructor(puffs: readonly CloudPuff[], materials: MaterialLibrary) {
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new BufferAttribute(CloudGenerator.PUFF.positions, 3));
    this.geometry.setAttribute("color", new BufferAttribute(linearColors(CloudGenerator.PUFF.colors), 3));
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();
    const euler = new Euler();
    const built: { layer: CloudLayer; mesh: InstancedMesh }[] = [];
    for (const layer of CLOUD_LAYERS) {
      const own = puffs.filter((p) => p.layer === layer);
      if (own.length === 0) continue;
      const mesh = new InstancedMesh(this.geometry, materials.facets, own.length);
      own.forEach((puff, i) => {
        position.set(puff.x, puff.y, puff.z);
        scale.set(puff.radiusX, puff.radiusY, puff.radiusZ);
        rotation.setFromEuler(euler.set(0, puff.yaw, 0));
        mesh.setMatrixAt(i, matrix.compose(position, rotation, scale));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      built.push({ layer, mesh });
    }
    this.layers = built;
  }

  dispose(): void {
    for (const { mesh } of this.layers) mesh.dispose();
    this.geometry.dispose();
  }
}
