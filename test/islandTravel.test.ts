import assert from "node:assert/strict";
import { test } from "node:test";
import { IslandTravel, mapAbove, travelDirection, travelSlug } from "../src/lib/atlas/islandTravel.ts";

test("page travel goes in from a map, out to a map, and is plain elsewhere", () => {
  assert.equal(travelDirection("/", "/islands/[slug]"), "in");
  assert.equal(travelDirection("/owners", "/owners/[slug]"), "in");
  assert.equal(travelDirection("/islands/[slug]", "/"), "out");
  assert.equal(travelDirection("/sources", "/"), null);
  assert.equal(travelDirection("/islands/[slug]", "/brokers/[id]"), null);
});

test("an island zooms out to the map it belongs to", () => {
  assert.equal(mapAbove("/islands/[slug]"), "/");
  assert.equal(mapAbove("/owners/[slug]"), "/owners");
});

const scene = (canLift = true) => {
  const lifted: string[] = [];
  return { lifted, settled: 0, lift(slug: string) { lifted.push(slug); return canLift; }, settle() { this.settled++; } };
};

test("the island is named by the page you left and by the page that arrives", async () => {
  const travel = new IslandTravel();
  const map = scene();
  travel.sceneReady(map);
  assert.equal(travel.depart("people-search"), true);
  travel.sceneGone(map);
  const arriving = travel.arrive("people-search");
  const page = scene();
  travel.sceneReady(page);
  await arriving;
  assert.deepEqual(page.lifted, ["people-search"]);
  travel.land();
  assert.equal(page.settled, 1);
});

test("a scene that is already drawn is used at once, and one drawn again is not lifted twice", async () => {
  const travel = new IslandTravel();
  const page = scene();
  travel.sceneReady(page);
  travel.sceneReady(page);
  await travel.arrive("a");
  assert.deepEqual(page.lifted, ["a"]);
});

test("a slow scene is left behind and not lifted after the transition has moved on", async () => {
  const travel = new IslandTravel();
  await travel.arrive("a", 1);
  const late = scene();
  travel.sceneReady(late);
  assert.deepEqual(late.lifted, []);
});

test("with no scene to leave from, nothing is shared", () => {
  assert.equal(new IslandTravel().depart("a"), false);
  assert.equal(travelSlug("in", { slug: "x" }, { slug: "y" }), "y");
  assert.equal(travelSlug("out", { slug: "x" }, {}), "x");
  assert.equal(travelSlug(null, { slug: "x" }, { slug: "y" }), null);
});

test("a kept picture belongs to the island it was taken of", () => {
  const travel = new IslandTravel();
  const picture = {} as HTMLCanvasElement;
  assert.equal(travel.hasKeptPicture, false);
  travel.keepPicture("a", picture);
  assert.equal(travel.keptPicture("a"), picture);
  assert.equal(travel.keptPicture("b"), null);
});
