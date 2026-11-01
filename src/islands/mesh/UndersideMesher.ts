import type { ColorRamp } from "../core/ColorRamp.ts";
import type { Vector3 } from "../core/IsoProjection.ts";
import type { ThemeRamps } from "../input/IslandTheme.ts";
import { HANGING_TIP_SIDES, hangingTipPoint, type HangingTip, type UndersideProfile, type UndersideRing } from "../shape/UndersideProfile.ts";
import type { TerraceStack } from "../shape/TerraceStack.ts";
import { CliffMesher } from "./CliffMesher.ts";
import type { FacetMeshBuilder } from "./FacetMeshBuilder.ts";
import { Ring, RingStitcher } from "./RingStitcher.ts";

const DARKEN_WITH_DEPTH = 1.6;

export class UndersideMesher {
  private readonly stack: TerraceStack;
  private readonly profile: UndersideProfile;
  private readonly ramps: ThemeRamps;

  constructor(stack: TerraceStack, profile: UndersideProfile, ramps: ThemeRamps) {
    this.stack = stack;
    this.profile = profile;
    this.ramps = ramps;
  }

  emitShell(builder: FacetMeshBuilder): void {
    let previous = CliffMesher.outlineRing(this.stack.tier(0), "foot");
    for (const data of this.profile.rings) {
      const ring = this.ring(data);
      const ramp = this.stratum(data.depthFraction);
      const offset = Math.max(0, data.depthFraction - 0.5) * DARKEN_WITH_DEPTH;
      RingStitcher.stitch(previous, ring, (a, b, c) => builder.undersideFacet(a, b, c, ramp, offset));
      previous = ring;
    }
    RingStitcher.fanToPoint(previous, this.profile.apex, (a, b, c) => builder.undersideFacet(a, b, c, this.ramps.deep, DARKEN_WITH_DEPTH / 2));
  }

  /** Hanging tips are separate closed pieces whose tops sit inside the shell. */
  emitTips(builder: FacetMeshBuilder): void {
    for (const tip of this.profile.tips) this.emitTip(builder, tip);
  }

  private stratum(depthFraction: number): ColorRamp {
    if (depthFraction < 0.25) return this.ramps.soil;
    if (depthFraction < 0.55) return this.ramps.stone;
    return this.ramps.deep;
  }

  private ring(data: UndersideRing): Ring {
    const table = this.stack.tier(0).foot.table;
    const points: Vector3[] = [];
    data.radii.forEach((radius, k) => {
      const column = k * data.stride;
      points.push({ x: data.centerX + radius * table.cos(column), y: data.y, z: data.centerZ + radius * table.sin(column) });
    });
    return new Ring(points);
  }

  private emitTip(builder: FacetMeshBuilder, tip: HangingTip): void {
    const circle = (radius: number, y: number): Ring => new Ring(Array.from({ length: HANGING_TIP_SIDES }, (_, i) => hangingTipPoint(tip, radius, y, i)));
    const top = circle(tip.radius, tip.y);
    const waist = circle(tip.radius * 0.55, tip.y - tip.length * 0.5);
    for (let i = 1; i < HANGING_TIP_SIDES - 1; i++) builder.undersideFacet(top.at(0), top.at(i + 1), top.at(i), this.ramps.deep);
    RingStitcher.stitch(top, waist, (a, b, c) => builder.undersideFacet(a, b, c, this.ramps.deep));
    const point = { x: tip.x, y: tip.y - tip.length, z: tip.z };
    RingStitcher.fanToPoint(waist, point, (a, b, c) => builder.undersideFacet(a, b, c, this.ramps.deep, DARKEN_WITH_DEPTH / 2));
  }
}
