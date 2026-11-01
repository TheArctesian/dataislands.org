import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { IslandGenerator } from "../src/islands/IslandGenerator.ts";
import { PLACEHOLDER_THEMES } from "../src/islands/preview/placeholderThemes.ts";

const ISLANDS = join(import.meta.dirname, "..", "src", "islands");
const PURE_DIRECTORIES = ["core", "input", "shape", "mesh", "props", "clouds"];
const BANNED: readonly [RegExp, string][] = [
  [/from\s+["']three/, "three"],
  [/\b(window|document|navigator|HTMLElement|requestAnimationFrame|localStorage)\b/, "browser global"],
  [/\bMath\.(random|sin|cos|tan|asin|acos|atan2?|sinh|cosh|tanh|exp|expm1|log|log2|log10|log1p|pow|cbrt|hypot)\b/, "platform-dependent Math"],
  [/\*\*/, "exponent operator"],
  [/\b(Date|performance)\b/, "clock"],
  [/from\s+["'][^"']*(render|preview|ownership)\//, "browser or broker import"],
];

function pureFiles(): string[] {
  const files = ["IslandGenerator.ts", "IslandModel.ts"].map((name) => join(ISLANDS, name));
  for (const directory of PURE_DIRECTORIES) {
    for (const name of readdirSync(join(ISLANDS, directory))) files.push(join(ISLANDS, directory, name));
  }
  return files;
}

test("generation code stays free of the browser, the clock and platform-dependent maths", () => {
  for (const file of pureFiles()) {
    const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    for (const [pattern, label] of BANNED) assert.ok(!pattern.test(code), `${file} uses ${label}`);
  }
});

test("generation works with non-deterministic sources stubbed to throw", (t) => {
  const forbid = (): never => {
    throw new Error("non-deterministic call during generation");
  };
  t.mock.method(Math, "random", forbid);
  t.mock.method(Math, "sin", forbid);
  t.mock.method(Math, "cos", forbid);
  t.mock.method(Math, "pow", forbid);
  t.mock.method(Date, "now", forbid);
  const model = new IslandGenerator().generate({ seed: 5, size: 255, theme: PLACEHOLDER_THEMES[1]! });
  assert.ok(model.triangleCount > 0);
});
