import { OrthographicCamera } from "three";
import { IsoProjection, type ScreenBounds } from "../core/IsoProjection.ts";
import { IsoFraming } from "./IsoFraming.ts";

const STANDOFF = 1400;

/** A fixed-angle orthographic camera. It frames; it never rotates. */
export class IsoCamera {
  readonly camera: OrthographicCamera;

  constructor() {
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 1, STANDOFF * 2);
  }

  static halfHeightFor(bounds: ScreenBounds, aspect: number): number {
    return IsoFraming.halfHeightFor(bounds, aspect);
  }

  frame(bounds: ScreenBounds, aspect: number, halfHeight: number): void {
    const focus = IsoProjection.worldFromScreen((bounds.minU + bounds.maxU) / 2, (bounds.minV + bounds.maxV) / 2);
    const view = IsoProjection.TO_CAMERA;
    const camera = this.camera;
    camera.position.set(focus.x + view.x * STANDOFF, focus.y + view.y * STANDOFF, focus.z + view.z * STANDOFF);
    camera.up.set(0, 1, 0);
    camera.lookAt(focus.x, focus.y, focus.z);
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
  }
}
