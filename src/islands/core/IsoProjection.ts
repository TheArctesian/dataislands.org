export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ScreenBounds {
  readonly minU: number;
  readonly maxU: number;
  readonly minV: number;
  readonly maxV: number;
}

const COS_PITCH = Math.sqrt(3) / 2;
const SIN_PITCH = 0.5;
const ROOT_HALF = Math.sqrt(0.5);

function normalize(x: number, y: number, z: number): Vector3 {
  const length = Math.sqrt(x * x + y * y + z * z);
  return { x: x / length, y: y / length, z: z / length };
}

/**
 * The one fixed view: right-handed, pitch 30 degrees, a 2:1 dimetric projection.
 * Culling, cloud exclusion, framing and the render camera all read it from here.
 */
export class IsoProjection {
  /** Unit vector from a point towards the camera. */
  static readonly TO_CAMERA: Vector3 = { x: -COS_PITCH * ROOT_HALF, y: SIN_PITCH, z: -COS_PITCH * ROOT_HALF };
  static readonly SCREEN_RIGHT: Vector3 = { x: -ROOT_HALF, y: 0, z: ROOT_HALF };
  static readonly SCREEN_UP: Vector3 = { x: SIN_PITCH * ROOT_HALF, y: COS_PITCH, z: SIN_PITCH * ROOT_HALF };
  /** Unit vector towards the sun. It lights faces on screen left. */
  static readonly SUN: Vector3 = normalize(0.55, 0.6235, -0.42);
  /** Plan distance a sight line travels for each unit of height on its way to the camera. */
  static readonly PLAN_PER_HEIGHT = COS_PITCH / SIN_PITCH;

  static screenU(x: number, _y: number, z: number): number {
    return (z - x) * ROOT_HALF;
  }

  static screenV(x: number, y: number, z: number): number {
    return (x + z) * SIN_PITCH * ROOT_HALF + y * COS_PITCH;
  }

  static facesCamera(nx: number, ny: number, nz: number): boolean {
    const view = IsoProjection.TO_CAMERA;
    return nx * view.x + ny * view.y + nz * view.z > 0;
  }

  /** Inverse of screenU and screenV on the plane through the world origin. */
  static worldFromScreen(u: number, v: number): Vector3 {
    const right = IsoProjection.SCREEN_RIGHT;
    const up = IsoProjection.SCREEN_UP;
    return { x: right.x * u + up.x * v, y: up.y * v, z: right.z * u + up.z * v };
  }
}
