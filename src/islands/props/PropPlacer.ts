import { DeterministicMath as M } from "../core/DeterministicMath.ts";
import { IsoProjection } from "../core/IsoProjection.ts";
import { ValueNoise2D } from "../core/PeriodicNoise.ts";
import type { SeededRandom } from "../core/SeededRandom.ts";
import type { SurfaceTone } from "../mesh/TerraceSurfaceMesher.ts";
import type { ClosedOutline } from "../shape/ClosedOutline.ts";
import type { TerraceStack } from "../shape/TerraceStack.ts";
import type { PropCatalog } from "./PropCatalog.ts";
import { Prop, type PropPlacement } from "./Prop.ts";

const RIM_MARGIN = 1.5;
const CLIFF_MARGIN = 1;
const ATTEMPTS = 14;
const TRIES_PER_SLOT = 4;
const BARE_LEDGE_TRIES = 6;
const SUMMIT_SHARE = 0.4;
const ROOMIEST_ACROSS = [0.2, 0.4, 0.6, 0.8] as const;
const ROOT_HALF = Math.sqrt(0.5);
const TREE_KINDS: ReadonlySet<string> = new Set(["conifer", "broadleaf", "palm"]);

interface Candidate {
  readonly tier: number;
  readonly x: number;
  readonly z: number;
  /** 0 at the cliff behind the ledge, 1 at the rim. */
  readonly across: number;
  readonly towardBack: number;
}

/** Heroes first, then rejection sampling, spending a triangle allowance so the cap holds by construction. */
export class PropPlacer {
  private readonly stack: TerraceStack;
  private readonly catalog: PropCatalog;
  private readonly tone: SurfaceTone;
  private readonly rng: SeededRandom;
  private readonly forest: ValueNoise2D;
  private readonly placed: PropPlacement[] = [];
  private readonly tierWeights: readonly number[];
  private readonly tierTries: number[];
  private readonly propScale: number;
  private remaining = 0;

  constructor(stack: TerraceStack, catalog: PropCatalog, tone: SurfaceTone, rng: SeededRandom, propScale: number) {
    this.stack = stack;
    this.catalog = catalog;
    this.tone = tone;
    this.rng = rng;
    this.propScale = propScale;
    this.tierTries = stack.tiers.map(() => 0);
    this.forest = new ValueNoise2D(rng, 38);
    this.tierWeights = stack.tiers.map((tier, t) => {
      const above = stack.tiers[t + 1];
      // Square root, because weighting by area alone sends most scenery to the broad summit.
      return Math.sqrt(Math.max(0, tier.rim.area() - (above ? above.foot.area() : 0)));
    });
  }

  place(target: number, allowance: number): readonly PropPlacement[] {
    this.remaining = allowance;
    this.placeHeroes();
    const tries = target * TRIES_PER_SLOT;
    const top = this.stack.tiers.length - 1;
    // Lower ledges fill up first, so without a limit the broad summit takes everything left over.
    const summitLimit = top === 0 ? target : Math.ceil(target * SUMMIT_SHARE);
    for (let n = 0; n < tries && this.placed.length < target; n++) {
      const prop = this.catalog.pick(this.rng);
      if (!prop || prop.triangleCost > this.remaining) continue;
      if (prop.isStructure && this.structureCount() >= this.stack.tiers.length) continue;
      const tier = this.pickTier();
      if (tier === top && this.placedOn(top) >= summitLimit) continue;
      this.tryPlace(prop, tier);
    }
    this.dressBareLedges();
    if (this.placed.length === 0) this.placeInRoomiestSpot();
    return this.placed;
  }

  /** Sampling can miss a narrow ledge entirely, which reads as scenery pooled on the summit. */
  private dressBareLedges(): void {
    const prop = this.catalog.smallest;
    if (!prop) return;
    for (const tier of this.stack.tiers) {
      for (let n = 0; n < BARE_LEDGE_TRIES && !this.placed.some((p) => p.tier === tier.index); n++) {
        if (prop.triangleCost <= this.remaining) this.tryPlace(prop, tier.index);
      }
    }
  }

  /** The roomiest spot on the island, for when sampling found nothing at all. */
  private placeInRoomiestSpot(): void {
    const prop = this.catalog.smallest;
    if (!prop || prop.triangleCost > this.remaining) return;
    let best: Candidate | null = null;
    let bestClearance = prop.footprint * this.propScale;
    for (const tier of this.stack.tiers) {
      const above = this.stack.tiers[tier.index + 1];
      for (let column = 0; column < tier.rim.table.count; column++) {
        const innerX = above ? above.foot.x(column) : 0;
        const innerZ = above ? above.foot.z(column) : 0;
        for (const across of ROOMIEST_ACROSS) {
          const x = M.lerp(innerX, tier.rim.x(column), across);
          const z = M.lerp(innerZ, tier.rim.z(column), across);
          if (!tier.rim.contains(x, z) || (above && above.foot.contains(x, z))) continue;
          const clearance = Math.min(tier.rim.distanceToEdge(x, z), above ? above.foot.distanceToEdge(x, z) : Infinity);
          if (clearance >= bestClearance) {
            bestClearance = clearance;
            best = { tier: tier.index, x, z, across, towardBack: 0 };
          }
        }
      }
    }
    if (best) this.commit(prop, best);
  }

  private placedOn(tier: number): number {
    return this.placed.filter((p) => p.tier === tier).length;
  }

  private structureCount(): number {
    return this.placed.filter((p) => this.catalog.prop(p.kind).isStructure).length;
  }

  private placeHeroes(): void {
    const structures = this.catalog.structures;
    if (structures.length === 0) return;
    const hero = structures[this.rng.int(0, structures.length - 1)]!;
    const top = this.stack.tiers.length - 1;
    if (hero.triangleCost <= this.remaining) this.tryPlace(hero, top);
  }

  private tryPlace(prop: Prop, onlyTier?: number): boolean {
    const isTree = TREE_KINDS.has(prop.kind);
    const isTall = prop.maxHeight >= 18;
    const tierIndex = onlyTier ?? this.pickTier();
    let best: Candidate | null = null;
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
      const candidate = this.sample(tierIndex);
      if (!this.fits(candidate, prop)) continue;
      if (isTree && attempt < ATTEMPTS - 2 && this.forest.sample(candidate.x, candidate.z) < 0.52) continue;
      if (prop.kind === "boulder" && candidate.across > 0.35 && attempt < ATTEMPTS - 2) continue;
      const score = isTall ? candidate.towardBack * (candidate.across - 0.5) : 0;
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
      if (!isTall || attempt >= 5) break;
    }
    if (!best) return false;
    this.commit(prop, best);
    return true;
  }

  private commit(prop: Prop, spot: Candidate): void {
    const height = this.rng.range(prop.minHeight, prop.maxHeight);
    const tier = this.stack.tier(spot.tier);
    this.placed.push({
      kind: prop.kind,
      tier: spot.tier,
      x: M.snap(spot.x),
      y: tier.y,
      z: M.snap(spot.z),
      footprint: prop.footprint * this.propScale,
      height,
      scale: this.propScale,
      yaw: prop.orient(this.rng.range(0, M.TAU)),
      groundRung: this.tone.rung(spot.tier, spot.x, spot.z),
      hasShadow: prop.castsShadow && this.shadowFits(spot, prop, height),
    });
    this.remaining -= prop.triangleCost;
  }

  /** The ledge furthest behind its share of tries, so scenery spreads down the island instead of pooling. */
  private pickTier(): number {
    const area = this.tierWeights.reduce((sum, w) => sum + w, 0) || 1;
    const tries = this.tierTries.reduce((sum, n) => sum + n, 0) + 1;
    let best = 0;
    let bestGap = -Infinity;
    for (let t = 0; t < this.tierWeights.length; t++) {
      const gap = this.tierWeights[t]! / area - this.tierTries[t]! / tries;
      if (gap > bestGap) {
        best = t;
        bestGap = gap;
      }
    }
    this.tierTries[best]!++;
    return best;
  }

  private sample(tierIndex: number): Candidate {
    const tier = this.stack.tier(tierIndex);
    const above = this.stack.tiers[tierIndex + 1];
    const table = tier.rim.table;
    const column = this.rng.int(0, table.count - 1);
    const along = this.rng.next();
    const between = (outline: ClosedOutline, axis: "x" | "z"): number => M.lerp(outline[axis](column), outline[axis](column + 1), along);
    const across = above ? this.rng.next() : Math.sqrt(this.rng.next());
    const innerX = above ? between(above.foot, "x") : 0;
    const innerZ = above ? between(above.foot, "z") : 0;
    const x = M.lerp(innerX, between(tier.rim, "x"), across);
    const z = M.lerp(innerZ, between(tier.rim, "z"), across);
    const length = Math.sqrt(x * x + z * z) || 1;
    return { tier: tierIndex, x, z, across, towardBack: ((x + z) / length) * ROOT_HALF };
  }

  private fits(candidate: Candidate, prop: Prop): boolean {
    const tier = this.stack.tier(candidate.tier);
    const above = this.stack.tiers[candidate.tier + 1];
    const { x, z } = candidate;
    const footprint = prop.footprint * this.propScale;
    if (!tier.rim.contains(x, z) || tier.rim.distanceToEdge(x, z) < footprint + RIM_MARGIN) return false;
    if (above && (above.foot.contains(x, z) || above.foot.distanceToEdge(x, z) < footprint + CLIFF_MARGIN)) return false;
    for (const other of this.placed) {
      const dx = other.x - x;
      const dz = other.z - z;
      const clear = other.footprint + footprint;
      if (dx * dx + dz * dz < clear * clear) return false;
    }
    return !this.hiddenByUpperTiers(candidate, prop.minHeight * this.propScale);
  }

  /** Props the higher terraces would hide spend budget for nothing. */
  private hiddenByUpperTiers(candidate: Candidate, height: number): boolean {
    const base = this.stack.tier(candidate.tier);
    for (let u = candidate.tier + 1; u < this.stack.tiers.length; u++) {
      const upper = this.stack.tier(u);
      const climb = upper.y - (base.y + height);
      if (climb <= 0) continue;
      const travel = climb * IsoProjection.PLAN_PER_HEIGHT * ROOT_HALF;
      if (upper.rim.contains(candidate.x - travel, candidate.z - travel)) return true;
    }
    return false;
  }

  private shadowFits(candidate: Candidate, prop: Prop, height: number): boolean {
    const center = Prop.shadowCenter(candidate.x, candidate.z, height * this.propScale);
    const reach = prop.footprint * this.propScale * 1.1;
    const tier = this.stack.tier(candidate.tier);
    const above = this.stack.tiers[candidate.tier + 1];
    if (!tier.rim.contains(center.x, center.z) || tier.rim.distanceToEdge(center.x, center.z) < reach) return false;
    return !above || (!above.foot.contains(center.x, center.z) && above.foot.distanceToEdge(center.x, center.z) >= reach);
  }
}
