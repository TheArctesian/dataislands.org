import assert from "node:assert/strict";
import { test } from "node:test";
import { PanZoomView } from "../src/lib/atlas/PanZoomView.ts";
import { ZoomOutPull } from "../src/lib/atlas/ZoomOutPull.ts";

test("zooming keeps the point under the pointer still", () => {
  const view = new PanZoomView(800, 600, 8).zoomAt(200, 150, 2);
  assert.equal(view.zoom, 2);
  assert.equal(view.x, -200);
  assert.equal(view.y, -150);
});

test("the view cannot leave the world or pass its zoom limits", () => {
  const start = new PanZoomView(800, 600, 4);
  assert.deepEqual([start.panBy(50, 50).x, start.panBy(50, 50).y], [0, 0]);
  const zoomed = start.zoomAt(0, 0, 100);
  assert.equal(zoomed.zoom, 4);
  assert.equal(zoomed.panBy(-99999, -99999).x, 800 - 3200);
  assert.equal(zoomed.zoomAt(400, 300, 0.001).zoom, 1);
  assert.equal(zoomed.zoomAt(400, 300, 0.001).x, 0);
});

test("a pinch only pulls once the whole island is showing", () => {
  const zoomedIn = new ZoomOutPull().by(2, 0.75);
  assert.equal(zoomedIn.pull.isPulling, false);
  assert.equal(zoomedIn.factor, 0.75);
  const pastFit = new ZoomOutPull().by(1.5, 0.5);
  assert.ok(Math.abs(pastFit.pull.stretch - Math.log(4 / 3)) < 1e-9);
});

test("a short pull stays and a long one leaves", () => {
  const short = new ZoomOutPull().by(1, 0.8).pull;
  assert.equal(short.willLeave, false);
  assert.ok(short.scale < 1);
  assert.equal(short.by(1, 0.75).pull.willLeave, true);
});

test("pinching back out spends the pull before the view zooms in", () => {
  const pulled = new ZoomOutPull().by(1, 0.8).pull;
  const partly = pulled.by(1, 1.1);
  assert.ok(partly.pull.isPulling);
  assert.ok(Math.abs(partly.factor - 1) < 1e-9);
  const past = pulled.by(1, 2);
  assert.equal(past.pull.isPulling, false);
  assert.ok(Math.abs(past.factor - 1.6) < 1e-9);
});
