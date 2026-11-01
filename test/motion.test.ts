import assert from "node:assert/strict";
import { test } from "node:test";
import { CriticalSpring, LatestRequest } from "../src/lib/atlas/motion.ts";

test("the camera spring reaches its target without overshoot", () => {
  const spring = new CriticalSpring(0, 0.35);
  let highest = 0;
  for (let i = 0; i < 120; i++) {
    spring.step(100, 1 / 60);
    highest = Math.max(highest, spring.value);
  }
  assert.ok(highest <= 100);
  assert.ok(spring.isAt(100, 0.1));
});

test("retargeting keeps position and speed continuous", () => {
  const spring = new CriticalSpring(0, 0.35);
  for (let i = 0; i < 6; i++) spring.step(100, 1 / 60);
  const { value, velocity } = spring;
  spring.step(-100, 1 / 600);
  assert.ok(Math.abs(spring.value - value) < velocity / 100);
  assert.ok(spring.velocity > 0, "it is still moving forward just after the change");
});

test("only the newest selection finishes, and a cancel stops it", () => {
  const requests = new LatestRequest<string>();
  const first = requests.begin("a")!;
  assert.equal(requests.begin("a"), null, "pressing the same one twice starts nothing");
  const second = requests.begin("b")!;
  assert.equal(requests.finish(first), false);
  assert.equal(requests.pending, "b");
  assert.equal(requests.finish(second), true);
  const third = requests.begin("c")!;
  requests.cancel();
  assert.equal(requests.finish(third), false);
  assert.equal(requests.pending, null);
});
