import assert from "node:assert/strict";
import { test } from "node:test";
import { type BrokerFile, type OwnershipFile, PublicAtlas } from "../src/lib/atlas/PublicAtlas.ts";

const fact = (value: string) => ({ value, sources: ["cppa"] });
const broker = (id: string, overrides: Partial<BrokerFile> = {}): BrokerFile => ({
  id, name: fact(id), inUsScope: true, domains: [], privacyUrls: [], optOutUrls: [], registrations: [], categoryHints: [],
  californiaDeclarations: null, prcCollects: null, ...overrides,
});
const owned = (brokerId: string, status: OwnershipFile["status"]): OwnershipFile => ({
  brokerId, status, isNamedOwner: false, owner: { key: "owner co", name: "Owner Co" }, evidence: { source: "s", url: "https://example.test", quote: "", date: "2026" },
});

test("the site names an owner only when its status is ready", () => {
  const atlas = new PublicAtlas(
    [broker("a"), broker("b"), broker("c")],
    [owned("a", "ready"), owned("b", "needs_check"), owned("c", "conflict")],
    [],
  );
  assert.equal(atlas.broker("a")?.owner?.name, "Owner Co");
  for (const id of ["b", "c"]) {
    assert.equal(atlas.broker(id)?.owner, null);
    assert.equal(atlas.broker(id)?.ownerBeingChecked, true);
    assert.ok(!JSON.stringify(atlas.broker(id)).includes("Owner Co"));
  }
});

test("a broker is placed by its accepted label, then a matching hint, and otherwise stays unsorted", () => {
  const categories = [{ id: "fraud-identity-verification", name: "Fraud", test: "" }, { id: "marketing-audiences", name: "Marketing", test: "" }, { id: "health", name: "Health", test: "" }];
  const label = { brokerId: "labelled", category: "marketing-audiences", evidenceUrl: "https://example.test", quote: "" };
  const atlas = new PublicAtlas(
    [broker("uk", { inUsScope: false }), broker("a"), broker("b", { categoryHints: [fact("risk_fraud")] }), broker("c", { categoryHints: [fact("background_check")] }), broker("labelled", { categoryHints: [fact("risk_fraud")] })],
    [], [], categories, [label],
  );
  assert.equal(atlas.broker("uk"), undefined);
  assert.equal(atlas.broker("labelled")?.islandSlug, "marketing-audiences");
  assert.equal(atlas.broker("b")?.islandSlug, "fraud-identity-verification");
  assert.equal(atlas.broker("c")?.islandSlug, "still-being-sorted");
  assert.equal(atlas.island("still-being-sorted")?.isProvisional, true);
  assert.equal(atlas.island("health"), undefined);
});

test("joined links are split, and anything that is not a web address is not offered", () => {
  const atlas = new PublicAtlas([broker("a", { optOutUrls: [fact("mailto:x@example.test"), fact("http://a.test; http://b.test"), fact("https://example.test/out")] })], [], []);
  assert.deepEqual(atlas.broker("a")?.optOutUrls.map((f) => f.value), ["http://a.test", "http://b.test", "https://example.test/out"]);
});

test("a broker shows only an icon the download kept", () => {
  const atlas = new PublicAtlas([broker("a"), broker("b")], [], [], [], [], new Map([["a", "a.png"]]));
  assert.equal(atlas.broker("a")?.iconFile, "a.png");
  assert.equal(atlas.broker("b")?.iconFile, null);
});

test("an owner group needs two verified brokers, and unverified links do not count", () => {
  const atlas = new PublicAtlas(
    [broker("a"), broker("b"), broker("c"), broker("d")],
    [owned("a", "ready"), owned("b", "ready"), owned("c", "needs_check"), { ...owned("d", "ready"), owner: { key: "solo", name: "Solo" } }],
    [],
  );
  assert.deepEqual(atlas.ownerGroups.map((g) => [g.slug, g.brokerCount]), [["owner-co", 2]]);
  assert.deepEqual(atlas.brokersOwnedBy("owner-co").map((b) => b.id), ["a", "b"]);
});
