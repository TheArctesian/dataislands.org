import assert from "node:assert/strict";
import { test } from "node:test";
import { IslandGenerator } from "../src/islands/IslandGenerator.ts";
import { PLACEHOLDER_THEMES } from "../src/islands/preview/placeholderThemes.ts";
import { ColorRamp } from "../src/islands/core/ColorRamp.ts";
import { IsoProjection } from "../src/islands/core/IsoProjection.ts";
import { polygonContains, polygonSolidity } from "../src/islands/shape/ClosedOutline.ts";
import { INDENT } from "../src/islands/shape/OutlineFactory.ts";
import { HANGING_TIP_SIDES, hangingTipPoint } from "../src/islands/shape/UndersideProfile.ts";

const theme = PLACEHOLDER_THEMES[0]!;
const generator = new IslandGenerator();
const SIZES = [0, 3, 15, 63, 255, 1023];

function forEachIsland(check: (seed: number, size: number) => void): void {
  for (let seed = 0; seed < 25; seed++) for (const size of SIZES) check(seed, size);
}

test("every tier sits inside the tier below, and each ledge is either closed or usable", () => {
  forEachIsland((seed, size) => {
    const { stack } = generator.shape({ seed, size, theme });
    for (let t = 1; t < stack.tiers.length; t++) {
      const tier = stack.tier(t);
      const below = stack.tier(t - 1);
      for (let i = 0; i < tier.rim.table.count; i++) {
        assert.ok(tier.rim.radius(i) < tier.foot.radius(i));
        const ledge = below.rim.radius(i) - tier.foot.radius(i);
        assert.ok(ledge === 0 || ledge >= stack.minLedge, `seed ${seed} size ${size} tier ${t}: ledge ${ledge}`);
      }
    }
  });
});

test("the underside tapers at every column and is deep", () => {
  forEachIsland((seed, size) => {
    const { stack, underside } = generator.shape({ seed, size, theme });
    assert.ok(underside.depth > 0.6 * stack.radius);
    const table = stack.tier(0).foot.table;
    let previous = (column: number): number => stack.tier(0).foot.radius(column);
    let previousY = stack.tier(0).footY;
    for (const ring of underside.rings) {
      assert.ok(ring.y < previousY);
      previousY = ring.y;
      ring.radii.forEach((radius, k) => assert.ok(radius < previous(k * ring.stride), `seed ${seed} column ${k * ring.stride}`));
      const prior = ring;
      previous = (column) => prior.radii[column / prior.stride] ?? prior.radii[Math.floor(column / prior.stride)]!;
    }
    assert.ok(underside.apex.y < previousY);
    assert.ok(table.count % 2 === 0);
  });
});

test("the projected base is not circular, and islands are not all alike", () => {
  const scores: number[] = [];
  for (let seed = 0; seed < 200; seed++) {
    const { stack } = generator.shape({ seed, size: 255, theme });
    const foot = stack.tier(0).foot;
    const score = polygonSolidity(foot.points());
    const radii = Array.from({ length: foot.table.count }, (_, i) => foot.radius(i));
    assert.ok(score >= 0.6, `seed ${seed}: solidity ${score}`);
    assert.ok(Math.max(...radii) / Math.min(...radii) >= 1.2, `seed ${seed}: too round`);
    scores.push(score);
  }
  assert.ok(Math.max(...scores) - Math.min(...scores) > 0.08);
});

test("the shell is watertight: every welded edge belongs to exactly two triangles", () => {
  const uncut = new IslandGenerator({ cull: false });
  forEachIsland((seed, size) => {
    const model = uncut.generate({ seed, size, theme });
    const shellEnd = model.layers.underside.start + model.layers.underside.count;
    const edges = new Map<string, number>();
    const vertex = (i: number): string => `${model.positions[i]},${model.positions[i + 1]},${model.positions[i + 2]}`;
    for (let t = 0; t < shellEnd; t++) {
      const corners = [vertex(t * 9), vertex(t * 9 + 3), vertex(t * 9 + 6)];
      for (let c = 0; c < 3; c++) {
        const a = corners[c]!;
        const b = corners[(c + 1) % 3]!;
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    for (const [edge, uses] of edges) assert.equal(uses, 2, `seed ${seed} size ${size}: edge ${edge}`);
  });
});

test("props stand on their ledge, clear of rims, cliffs and each other", () => {
  forEachIsland((seed, size) => {
    const model = generator.generate({ seed, size, theme });
    const { stack } = generator.shape({ seed, size, theme });
    model.placements.forEach((prop, index) => {
      const tier = stack.tier(prop.tier);
      const above = stack.tiers[prop.tier + 1];
      assert.equal(prop.y, tier.y);
      assert.ok(tier.rim.contains(prop.x, prop.z) && tier.rim.distanceToEdge(prop.x, prop.z) >= prop.footprint);
      if (above) assert.ok(!above.foot.contains(prop.x, prop.z) && above.foot.distanceToEdge(prop.x, prop.z) >= prop.footprint);
      for (const other of model.placements.slice(index + 1)) {
        const distance = Math.sqrt((other.x - prop.x) ** 2 + (other.z - prop.z) ** 2);
        assert.ok(distance >= other.footprint + prop.footprint - 0.01, `seed ${seed} size ${size}: ${prop.kind} and ${other.kind}`);
      }
    });
  });
});

test("radius never shrinks as size grows", () => {
  let previous = 0;
  for (let size = 0; size <= 1100; size += 7) {
    const radius = generator.shape({ seed: 3, size, theme }).stack.radius;
    assert.ok(radius >= previous);
    previous = radius;
  }
});

test("a plan's radius stays in range and is continuous across the 0/TAU seam", () => {
  for (let seed = 0; seed < 3000; seed++) {
    const { identity } = generator.shape({ seed, size: 255, theme });
    const tau = 6.283185307179586;
    for (let k = 0; k < 64; k++) {
      const radius = identity.radiusAt((k / 64) * tau);
      assert.ok(radius >= 1 - INDENT - 1e-9 && radius <= 1 + 1e-9, `seed ${seed}: radius ${radius}`);
    }
    assert.ok(Math.abs(identity.radiusAt(tau - 1e-4) - identity.radiusAt(0)) < 0.01, `seed ${seed}: seam jump`);
  }
});

test("hanging tips are closed solids whose tops sit inside the shell", () => {
  const uncut = new IslandGenerator({ cull: false });
  let tips = 0;
  for (let seed = 0; seed < 200; seed++) {
    const input = { seed, size: 255, theme };
    const { underside, stack } = generator.shape(input);
    const table = stack.tier(0).foot.table;
    for (const tip of underside.tips) {
      tips++;
      const ring = underside.rings.find((r) => r.y === tip.y)!;
      const outline = ring.radii.map((radius, k) => ({ x: ring.centerX + radius * table.cos(k * ring.stride), z: ring.centerZ + radius * table.sin(k * ring.stride) }));
      for (let side = 0; side < HANGING_TIP_SIDES; side++) {
        assert.ok(polygonContains(outline, hangingTipPoint(tip, tip.radius, tip.y, side)), `seed ${seed}: tip pokes out of the shell`);
      }
    }
    const model = uncut.generate(input);
    const { start, count } = model.layers.tips;
    const edges = new Map<string, number>();
    const vertex = (i: number): string => `${model.positions[i]},${model.positions[i + 1]},${model.positions[i + 2]}`;
    for (let t = start; t < start + count; t++) {
      const corners = [vertex(t * 9), vertex(t * 9 + 3), vertex(t * 9 + 6)];
      for (let c = 0; c < 3; c++) {
        const a = corners[c]!;
        const b = corners[(c + 1) % 3]!;
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    for (const [edge, uses] of edges) assert.equal(uses, 2, `seed ${seed}: open tip edge ${edge}`);
  }
  assert.ok(tips > 50);
});

test("no summit vertex gathers a radial fan of facets", () => {
  const uncut = new IslandGenerator({ cull: false });
  forEachIsland((seed, size) => {
    const model = uncut.generate({ seed, size, theme });
    const uses = new Map<string, number>();
    const { start, count } = model.layers.surface;
    for (let i = start * 9; i < (start + count) * 9; i += 3) {
      const key = `${model.positions[i]},${model.positions[i + 1]},${model.positions[i + 2]}`;
      uses.set(key, (uses.get(key) ?? 0) + 1);
    }
    assert.ok(Math.max(...uses.values()) <= 12, `seed ${seed} size ${size}: ${Math.max(...uses.values())} facets at one vertex`);
  });
});

test("every island has props at every size, and large ones stay well dressed", () => {
  for (let seed = 0; seed < 300; seed++) {
    const candidate = PLACEHOLDER_THEMES[seed % PLACEHOLDER_THEMES.length]!;
    for (const size of [0, 1, 3]) assert.ok(generator.generate({ seed, size, theme: candidate }).placements.length >= 1, `${candidate.name} seed ${seed} size ${size}`);
  }
  let total = 0;
  for (let seed = 0; seed < 50; seed++) total += generator.generate({ seed, size: 1023, theme }).placements.length;
  assert.ok(total / 50 > 18, `average ${total / 50}`);
});

test("hut ridges never lie along the screen, where one roof slope would fill the view", () => {
  const huts = PLACEHOLDER_THEMES.find((t) => t.propMix.hut)!;
  let seen = 0;
  for (let seed = 0; seed < 200; seed++) {
    for (const prop of generator.generate({ seed, size: 63, theme: huts }).placements) {
      if (prop.kind !== "hut") continue;
      seen++;
      const alongScreen = Math.abs(Math.cos(prop.yaw) * IsoProjection.SCREEN_RIGHT.x + Math.sin(prop.yaw) * IsoProjection.SCREEN_RIGHT.z);
      assert.ok(alongScreen <= Math.cos(Math.PI / 6) + 1e-6, `seed ${seed}: ${alongScreen}`);
    }
  }
  assert.ok(seen > 20);
});

test("no cloud in front of the keel covers its tip or a hanging tip", () => {
  for (let seed = 0; seed < 300; seed++) {
    for (const size of [3, 255, 1023]) {
      const input = { seed, size, theme };
      const { underside } = generator.shape(input);
      const points = [underside.apex, ...underside.tips.map((t) => ({ x: t.x, y: t.y - t.length, z: t.z }))];
      const view = IsoProjection.TO_CAMERA;
      for (const puff of generator.generate(input).puffs) {
        if (puff.x * view.x + puff.y * view.y + puff.z * view.z <= underside.apex.x * view.x + underside.apex.y * view.y + underside.apex.z * view.z) continue;
        for (const point of points) {
          const du = (IsoProjection.screenU(point.x, point.y, point.z) - IsoProjection.screenU(puff.x, puff.y, puff.z)) / puff.radiusX;
          const dv = (IsoProjection.screenV(point.x, point.y, point.z) - IsoProjection.screenV(puff.x, puff.y, puff.z)) / (puff.radiusX * 0.35 + puff.radiusY);
          assert.ok(du * du + dv * dv > 1, `seed ${seed} size ${size}: a ${puff.layer} puff covers a tip`);
        }
      }
    }
  }
});

test("grass and deep ramps run from light to dark, so rung offsets never read as hue noise", () => {
  const lightness = (hex: string): number => {
    const [r, g, b] = ColorRamp.parse(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  for (const { name, palette } of PLACEHOLDER_THEMES) {
    for (const ramp of [palette.grass, palette.deep]) {
      for (let i = 1; i < ramp.length; i++) assert.ok(lightness(ramp[i]!) < lightness(ramp[i - 1]!), `${name}: ${ramp[i - 1]} then ${ramp[i]}`);
    }
  }
});

test("large islands keep few terraces, and scenery is not pooled on the summit", () => {
  let summit = 0;
  let all = 0;
  let oneLedge = 0;
  for (let seed = 0; seed < 200; seed++) {
    const input = { seed, size: 1023, theme };
    const { stack } = generator.shape(input);
    assert.ok(stack.tiers.length <= 4, `seed ${seed}: ${stack.tiers.length} tiers`);
    const { placements } = generator.generate(input);
    all += placements.length;
    summit += placements.filter((prop) => prop.tier === stack.tiers.length - 1).length;
    assert.ok(placements.every((prop) => prop.scale > 2), `seed ${seed}: props not scaled`);
    if (stack.tiers.length >= 3 && new Set(placements.map((prop) => prop.tier)).size < 2) oneLedge++;
  }
  assert.ok(summit / all < 0.5, `summit holds ${summit} of ${all}`);
  // Mesas are flat by design, so their lower ledges can collapse and leave only the top.
  assert.ok(oneLedge < 20, `${oneLedge} of 200 islands dress one ledge only`);
});
