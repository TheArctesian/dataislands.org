import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { IslandGenerator } from "../src/islands/IslandGenerator.ts";
import { CLOUD_TRIANGLE_CAP, ISLAND_TRIANGLE_CAP } from "../src/islands/input/IslandScale.ts";
import { PLACEHOLDER_THEMES } from "../src/islands/preview/placeholderThemes.ts";

const theme = PLACEHOLDER_THEMES[0]!;
const generator = new IslandGenerator();

function digest(seed: number, size: number): string {
  const model = generator.generate({ seed, size, theme });
  return createHash("sha256").update(Buffer.from(model.positions.buffer)).update(model.colors).update(JSON.stringify(model.puffs)).digest("hex");
}

test("the same input gives byte-identical output, including in another process", () => {
  assert.equal(digest(7, 63), digest(7, 63));
  const script = `
    import { createHash } from "node:crypto";
    import { IslandGenerator } from "./src/islands/IslandGenerator.ts";
    import { PLACEHOLDER_THEMES } from "./src/islands/preview/placeholderThemes.ts";
    const model = new IslandGenerator().generate({ seed: 7, size: 63, theme: PLACEHOLDER_THEMES[0] });
    process.stdout.write(createHash("sha256").update(Buffer.from(model.positions.buffer)).update(model.colors).update(JSON.stringify(model.puffs)).digest("hex"));
  `;
  const other = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  assert.equal(other, digest(7, 63));
});

test("different seeds give different islands", () => {
  const digests = new Set([1, 2, 3, 4, 5].map((seed) => digest(seed, 63)));
  assert.equal(digests.size, 5);
});

test("a larger size gives a larger island with more triangles", () => {
  const span = (size: number): number => {
    const { screenBounds: b } = generator.generate({ seed: 11, size, theme });
    return b.maxU - b.minU;
  };
  assert.ok(span(1023) > span(63) && span(63) > span(0));
  const triangles = (size: number): number => generator.generate({ seed: 11, size, theme }).triangleCount;
  assert.ok(triangles(1023) > triangles(0));
});

test("the triangle budget holds over 200 seeds at the size extremes, for island and clouds", () => {
  for (let seed = 0; seed < 200; seed++) {
    const candidate = PLACEHOLDER_THEMES[seed % PLACEHOLDER_THEMES.length]!;
    for (const size of [0, 1023, 5000]) {
      const model = generator.generate({ seed, size, theme: candidate });
      assert.ok(model.offeredTriangles <= ISLAND_TRIANGLE_CAP, `${candidate.name} seed ${seed} size ${size}: ${model.offeredTriangles}`);
      assert.ok(model.cloudTriangleCount <= CLOUD_TRIANGLE_CAP, `${candidate.name} seed ${seed} size ${size}: clouds ${model.cloudTriangleCount}`);
    }
  }
});

test("invalid input throws", () => {
  for (const bad of [{ seed: 1, size: Number.NaN }, { seed: 1, size: -1 }, { seed: -1, size: 1 }, { seed: 1.5, size: 1 }]) {
    assert.throws(() => generator.generate({ ...bad, theme }), RangeError);
  }
});
