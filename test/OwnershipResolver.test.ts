import assert from "node:assert/strict";
import { test } from "node:test";
import { BrokerPageSource } from "../src/ownership/sources/ClaimSources.ts";
import { Corrections } from "../src/ownership/sources/Corrections.ts";
import { CsvTable } from "../src/ownership/sources/CsvTable.ts";
import { Broker, BrokerIndex } from "../src/ownership/model/Broker.ts";
import { Company, CompanyDirectory } from "../src/ownership/model/Company.ts";
import { type Confidence, Evidence } from "../src/ownership/model/Evidence.ts";
import { ClaimOrigin, OwnershipClaim } from "../src/ownership/model/OwnershipClaim.ts";
import { OwnershipResolver } from "../src/ownership/model/OwnershipResolver.ts";
import { MergeDecision } from "../src/ownership/model/MergeDecision.ts";
import { Source, SourceCatalog, Sourced } from "../src/ownership/model/Source.ts";

const source = new Source({ id: "test", kind: "web_page", url: "https://example.test" });
const catalog = new SourceCatalog();
catalog.add(source);
const empty = { dba: {}, domains: {}, privacy_urls: {}, opt_out_urls: {}, states: {}, countries: {}, registries: {}, category_hints: {}, california_declarations: [], prc_collects: [] };
const census = {
  id: "acme", name: "Acme Data", aliases: ["Acme Data"], dba: [], domains: [], hold_back: false, in_us_scope: true,
  california_declarations: null, prc_collects: {}, removed_domains: [],
  provenance: { ...empty, aliases: { "Acme Data": ["test"] } },
};
const broker = new Broker(census, catalog);
const resolver = new OwnershipResolver({ staleBefore: "2022-01-01" });

function claim(owner: string, date: string, options: { confidence?: Confidence; opened?: boolean; origin?: ClaimOrigin; immediate?: string } = {}) {
  return new OwnershipClaim({
    brokerId: broker.id,
    origin: options.origin ?? ClaimOrigin.ParentReview,
    evidence: new Evidence({ source, date, confidence: options.confidence ?? "high", opened: options.opened ?? true }),
    ultimateParent: new Company(owner, source),
    immediateParent: options.immediate ? new Company(options.immediate, source) : null,
  });
}

test("a sale announced later replaces the old owner", () => {
  const record = resolver.resolve(broker, [claim("Old Owner", "2024-05-01"), claim("New Owner", "2026-01-08")]);
  assert.equal(record.status, "ready");
  assert.equal(record.owner?.name, "New Owner");
  assert.deepEqual(record.superseded.map((c) => c.owner?.name), ["Old Owner"]);
});

test("different owners with dates that cannot be ordered are a conflict", () => {
  for (const [first, second] of [["2026", "2026-03-01"], ["2026-03-01", ""]] as const) {
    const record = resolver.resolve(broker, [claim("One", first), claim("Two", second)]);
    assert.equal(record.status, "conflict");
    assert.equal(record.conflicts.length, 1);
  }
});

test("sources naming different levels of one chain agree", () => {
  const record = resolver.resolve(broker, [claim("Top Co", "2026-02-01", { immediate: "Mid Co" }), claim("Mid Co", "2026-02-01")]);
  assert.equal(record.status, "ready");
  assert.equal(record.corroboratedBy.length, 1);
});

test("weak answers are held for checking, with the reason", () => {
  const cases = [
    { made: claim("Owner", "2021-11-19"), reason: "stale_evidence" },
    { made: claim("Owner", ""), reason: "undated_evidence" },
    { made: claim("Owner", "2026-01-01", { confidence: "medium" }), reason: "medium_confidence" },
    { made: claim("Owner", "2026-01-01", { origin: ClaimOrigin.FirstPass }), reason: "unverified_source" },
  ];
  for (const { made, reason } of cases) {
    const record = resolver.resolve(broker, [made]);
    assert.equal(record.status, "needs_check");
    assert.deepEqual(record.reasons, [reason]);
  }
});

test("a source nobody opened cannot name an owner", () => {
  const unread = [claim("Owner", "2026-01-01", { opened: false }), claim("Owner", "2026-01-01", { confidence: "low" })];
  const record = resolver.resolve(broker, unread);
  assert.equal(record.status, "unknown");
  assert.equal(record.owner, null);
});

test("spellings of one company share a key", () => {
  assert.equal(Company.keyOf("MOODYS CORP /DE/"), Company.keyOf("Moody's Corporation"));
  assert.equal(Company.keyOf("Cision (Platinum Equity per search results)"), Company.keyOf("Cision"));
});

test("a fact with no source cannot be created", () => {
  assert.throws(() => new Sourced("example.test", []), /no source/);
  assert.throws(() => new Broker({ ...census, provenance: { ...census.provenance, aliases: {} } }, catalog), /no source/);
  assert.throws(() => new Broker({ ...census, provenance: { ...census.provenance, domains: { "a.test": ["missing"] } } }, catalog), /unknown source/);
  assert.throws(() => new MergeDecision({ item: "M1", brokerId: "acme", verdict: "one_company", evidence: null }), /no source/);
});

test("a company keeps a ticker learned after a claim already points at it", () => {
  const directory = new CompanyDirectory();
  const company = directory.find("Example Corp", source);
  directory.find("EXAMPLE CORP", source, "EXM");
  assert.equal(company?.ticker?.value, "EXM");
});

test("repeat citations of one page share a source", () => {
  const sources = new SourceCatalog();
  assert.equal(sources.forUrl("https://example.test/a"), sources.forUrl("https://example.test/a", "news"));
  assert.equal(sources.forUrl(""), null);
});

test("a page naming who runs a site does not make that company the owner", () => {
  const brokers = new BrokerIndex([broker], {}, {});
  const context = { brokers, companies: new CompanyDirectory(), catalog, corrections: new Corrections({ brokerIds: {}, brokerNames: {}, companyNames: {}, merges: {}, rejectedClaims: [] }), unmatched: [], rowsWithoutSource: 0 };
  const table = new CsvTable("broker_id,relation,parent,operator,evidence_url,evidence_quote,confidence,note\nacme,operator_only,,Acme Ops,https://example.test/privacy,,high,\n");
  const pages = new BrokerPageSource(table, context, "2026-10-31");
  assert.deepEqual(pages.claims(), []);
  assert.equal(pages.operators().get("acme")?.value, "Acme Ops");
});

test("the confidence score ranks support and shows its reasons", () => {
  const scored = (claims: OwnershipClaim[]) => resolver.resolve(broker, claims).confidenceScore!;
  const strong = scored([claim("Owner", "2026-01-01")]);
  assert.ok(scored([claim("Owner", "2026-01-01", { confidence: "medium" })]).value < strong.value);
  assert.ok(scored([claim("Owner", "2021-01-01")]).factors.some((f) => f.factor === "stale"));
  assert.equal(scored([claim("One", "2026"), claim("Two", "2026-03-01")]).value, 0.3);
});
