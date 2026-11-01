import assert from "node:assert/strict";
import { test } from "node:test";
import { IconSpots } from "../src/lib/atlas/IconSpots.ts";
import { islandInput } from "../src/lib/atlas/islandInput.ts";
import { IslandGenerator } from "../src/islands/IslandGenerator.ts";

const generator = new IslandGenerator();
const finder = (slug: string, count: number) => {
  const input = islandInput(slug, count, 0);
  return new IconSpots(generator.shape(input).stack, generator.generate(input).screenBounds);
};

test("icon spots stay inside the box, keep their spacing and repeat exactly", () => {
  for (const [slug, count] of [["one", 1], ["some", 40], ["many", 400]] as const) {
    const spots = finder(slug, count).spots(800, 600, 40);
    assert.ok(spots.length > 0);
    assert.deepEqual(spots, finder(slug, count).spots(800, 600, 40));
    for (const [index, spot] of spots.entries()) {
      assert.ok(spot.left >= 0 && spot.left <= 800 && spot.top >= 0 && spot.top <= 600);
      for (const other of spots.slice(index + 1)) assert.ok(Math.hypot(spot.left - other.left, spot.top - other.top) >= 40);
    }
  }
});

test("a smaller box holds fewer icons", () => {
  const big = finder("many", 400);
  assert.ok(big.spots(375, 400, 40).length < big.spots(1000, 800, 40).length);
});

test("every icon gets its own place, even on the biggest island", () => {
  const layout = finder("many", 400).layout(400, 375, 412, 30);
  assert.equal(layout.positions.length, 400);
  assert.equal(new Set(layout.positions.map((p) => `${p.x},${p.y}`)).size, 400);
  assert.ok(layout.scale > 1);
  assert.ok(layout.positions.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
});
