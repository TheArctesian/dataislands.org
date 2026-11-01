import assert from "node:assert/strict";
import { test } from "node:test";
import { PanZoomView } from "../src/lib/atlas/PanZoomView.ts";

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
