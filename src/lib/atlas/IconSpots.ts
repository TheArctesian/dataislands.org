import { IsoFraming } from "../../islands/render/IsoFraming.ts";
import { IsoProjection, type ScreenBounds } from "../../islands/core/IsoProjection.ts";
import type { TerraceStack } from "../../islands/shape/TerraceStack.ts";

export interface IconLayout {
  /** How far the island must be enlarged for every icon to have its own ground. */
  readonly scale: number;
  /** Positions as fractions of the box, one per icon, back to front. */
  readonly positions: readonly { readonly x: number; readonly y: number }[];
}

export interface IconSpot {
  /** Pixels from the left and top of the island's box. */
  readonly left: number;
  readonly top: number;
}

const GRID_STEPS = 90;
const EDGE_CLEARANCE = 2;
const SCALE_STEP = 1.15;
const MAX_LAYOUT_SCALE = 16;

/** Finds visible flat ground on an island and spaces icon positions across it, in the box's pixels. */
export class IconSpots {
  private readonly ground: readonly { u: number; v: number }[];
  private readonly bounds: ScreenBounds;

  constructor(stack: TerraceStack, bounds: ScreenBounds) {
    this.bounds = bounds;
    this.ground = IconSpots.visibleGround(stack);
  }

  /** The smallest enlargement that gives each icon a spot, spread evenly over the ground. */
  layout(count: number, width: number, height: number, spacing: number): IconLayout {
    let scale = 1;
    let found = this.spots(width, height, spacing);
    while (found.length < count && scale < MAX_LAYOUT_SCALE) {
      scale *= SCALE_STEP;
      found = this.spots(width * scale, height * scale, spacing);
    }
    const picks = Array.from({ length: Math.min(count, found.length) }, (_, index) => found[Math.floor((index * found.length) / count)]!);
    return { scale, positions: picks.map((spot) => ({ x: spot.left / (width * scale), y: spot.top / (height * scale) })) };
  }

  /** Back to front, so nearer icons draw over farther ones. */
  spots(width: number, height: number, spacing: number): IconSpot[] {
    const half = IsoFraming.halfHeightFor(this.bounds, width / height);
    const pixelsPerUnit = height / (half * 2);
    const midU = (this.bounds.minU + this.bounds.maxU) / 2;
    const midV = (this.bounds.minV + this.bounds.maxV) / 2;
    const chosen: IconSpot[] = [];
    for (const { u, v } of this.ground) {
      const spot = { left: width / 2 + (u - midU) * pixelsPerUnit, top: height / 2 - (v - midV) * pixelsPerUnit };
      if (chosen.every((other) => Math.hypot(other.left - spot.left, other.top - spot.top) >= spacing)) chosen.push(spot);
    }
    return chosen;
  }

  private static visibleGround(stack: TerraceStack): { u: number; v: number }[] {
    const reach = stack.radius * 1.2;
    const step = (reach * 2) / GRID_STEPS;
    const found: { u: number; v: number }[] = [];
    for (let row = 0; row <= GRID_STEPS; row++) {
      for (let column = 0; column <= GRID_STEPS; column++) {
        const x = -reach + column * step;
        const z = -reach + row * step;
        const y = IconSpots.groundHeight(stack, x, z);
        if (y === null || IconSpots.hiddenByHigherTier(stack, x, y, z)) continue;
        found.push({ u: IsoProjection.screenU(x, y, z), v: IsoProjection.screenV(x, y, z) });
      }
    }
    return found.sort((a, b) => b.v - a.v || a.u - b.u);
  }

  private static groundHeight(stack: TerraceStack, x: number, z: number): number | null {
    for (const tier of [...stack.tiers].reverse()) {
      if (tier.foot.contains(x, z)) {
        return tier.rim.contains(x, z) && tier.rim.distanceToEdge(x, z) > EDGE_CLEARANCE ? tier.y : null;
      }
    }
    return null;
  }

  /** Walks the sight line towards the camera and checks each higher tier it passes under. */
  private static hiddenByHigherTier(stack: TerraceStack, x: number, y: number, z: number): boolean {
    const view = IsoProjection.TO_CAMERA;
    const flat = Math.hypot(view.x, view.z);
    return stack.tiers.some((tier) => {
      if (tier.y <= y) return false;
      const plan = (tier.y - y) * IsoProjection.PLAN_PER_HEIGHT;
      return tier.foot.contains(x + (view.x / flat) * plan, z + (view.z / flat) * plan);
    });
  }
}
