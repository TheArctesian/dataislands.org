import assert from "node:assert/strict";
import { test } from "node:test";
import { flightFrames, isInside, restingRect } from "../src/lib/atlas/IconFlight.ts";

test("a box in a scaling sheet is measured where it will rest", () => {
  const resting = restingRect({ left: 192, top: 192, width: 46, height: 46 }, { x: 100, y: 100 }, 0.92);
  assert.deepEqual([resting.left, resting.top, resting.width, resting.height].map(Math.round), [200, 200, 50, 50]);
});

test("the flight starts over the source and ends at natural size on the target", () => {
  const frames = flightFrames({ left: 10, top: 20, width: 28, height: 28 }, { left: 300, top: 40, width: 56, height: 56 });
  assert.equal(frames[0]!.transform, "translate(10px, 20px) scale(0.5)");
  assert.equal(frames[1]!.transform, "translate(300px, 40px) scale(1)");
});

test("an icon scrolled out of the sheet or with no size cannot fly", () => {
  const sheet = { left: 0, top: 0, width: 100, height: 100 };
  assert.equal(isInside({ left: 10, top: 10, width: 20, height: 20 }, sheet), true);
  assert.equal(isInside({ left: 10, top: -30, width: 20, height: 20 }, sheet), false);
  assert.equal(isInside({ left: 10, top: 10, width: 0, height: 0 }, sheet), false);
});
